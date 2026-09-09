import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class WebAuthnService {
  private readonly rpName = 'CodePlatform Enterprise';
  private readonly rpId: string;
  private readonly expectedOrigin: string;

  // In-memory challenge store (or can be swapped with Redis)
  private readonly challengeStore = new Map<string, { challenge: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.rpId = this.configService.get<string>('auth.webauthn.rpId') || 'localhost';
    this.expectedOrigin =
      this.configService.get<string>('auth.webauthn.origin') || 'http://localhost:3000';
  }

  private cleanExpiredChallenges(): void {
    const now = Date.now();
    for (const [key, value] of this.challengeStore.entries()) {
      if (now > value.expiresAt) {
        this.challengeStore.delete(key);
      }
    }
  }


  /**
   * Generates WebAuthn registration options/challenge for adding a physical key / passkey
   */
  async generatePasskeyRegistrationOptions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const excludeCredentials = user.passkeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as any,
    }));

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userName: user.email,
      userDisplayName: user.name,
      userID: new Uint8Array(Buffer.from(user.id)),
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Save challenge with 5-minute expiry
    this.cleanExpiredChallenges();
    this.challengeStore.set(`reg:${userId}`, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return options;
  }

  /**
   * Verifies the physical security key's cryptographic signature & saves credential
   */
  async verifyPasskeyRegistration(
    userId: string,
    response: any,
    deviceName?: string,
  ): Promise<{ verified: boolean; passkeyId: string }> {
    const stored = this.challengeStore.get(`reg:${userId}`);
    if (!stored || Date.now() > stored.expiresAt) {
      throw new BadRequestException('Passkey registration challenge expired. Please retry.');
    }

    this.challengeStore.delete(`reg:${userId}`);

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: stored.challenge,
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.rpId,
      });
    } catch (err: any) {
      throw new BadRequestException(`Passkey verification failed: ${err?.message || 'Invalid signature'}`);
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      throw new BadRequestException('Physical security key registration could not be verified.');
    }

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

    const newPasskey = await this.prisma.passkeyCredential.create({
      data: {
        userId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        transports: credential.transports || [],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        name: deviceName || (credentialBackedUp ? 'Synced Passkey (iCloud/Google)' : 'Hardware Security Key (FIDO2)'),
      },
    });

    return { verified: true, passkeyId: newPasskey.id };
  }

  /**
   * Generates WebAuthn authentication challenge for passwordless physical key login
   */
  async generatePasskeyLoginOptions(email?: string) {
    let allowCredentials: any[] | undefined = undefined;

    if (email) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (user && user.passkeys.length > 0) {
        allowCredentials = user.passkeys.map((p) => ({
          id: p.credentialId,
          transports: p.transports as any,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpId,
      allowCredentials,
      userVerification: 'preferred',
    });

    // Challenge session key
    this.cleanExpiredChallenges();
    const sessionKey = email ? `auth:${email}` : `auth:challenge:${options.challenge}`;
    this.challengeStore.set(sessionKey, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { ...options, challengeKey: sessionKey };
  }

  /**
   * Verifies the physical security key login signature against the stored public key & counter
   */
  async verifyPasskeyLogin(
    response: any,
    challengeKey: string,
  ): Promise<{ verified: boolean; userId: string; email: string; globalRole: string }> {
    const stored = this.challengeStore.get(challengeKey);
    if (!stored || Date.now() > stored.expiresAt) {
      throw new UnauthorizedException('Authentication challenge expired. Please retry.');
    }

    this.challengeStore.delete(challengeKey);

    const credentialId = response.id;
    const passkey = await this.prisma.passkeyCredential.findUnique({
      where: { credentialId },
      include: { user: true },
    });

    if (!passkey) {
      throw new UnauthorizedException('Unrecognized security key. Please use a registered device.');
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: stored.challenge,
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.rpId,
        credential: {
          id: passkey.credentialId,
          publicKey: new Uint8Array(passkey.publicKey),
          counter: Number(passkey.counter),
          transports: passkey.transports as any,
        },
      });
    } catch (err: any) {
      throw new UnauthorizedException(`Security key verification failed: ${err?.message || 'Invalid signature'}`);
    }

    const { verified, authenticationInfo } = verification;

    if (!verified || !authenticationInfo) {
      throw new UnauthorizedException('Physical security key signature verification failed.');
    }

    // Counter rollback protection against replay attacks
    await this.prisma.passkeyCredential.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    return {
      verified: true,
      userId: passkey.user.id,
      email: passkey.user.email,
      globalRole: passkey.user.globalRole,
    };
  }

  /**
   * Lists all registered passkeys & security keys for a user
   */
  async listUserPasskeys(userId: string) {
    const passkeys = await this.prisma.passkeyCredential.findMany({
      where: { userId },
      select: {
        id: true,
        credentialId: true,
        name: true,
        deviceType: true,
        backedUp: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return passkeys;
  }

  /**
   * Removes a registered security key
   */
  async deletePasskey(userId: string, passkeyId: string) {
    await this.prisma.passkeyCredential.deleteMany({
      where: { id: passkeyId, userId },
    });
    return { success: true };
  }
}
