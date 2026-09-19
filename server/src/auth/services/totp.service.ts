import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface TotpSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

@Injectable()
export class TotpService {
  private readonly appName = 'CodePlatform';
  private readonly encryptionKeys: Buffer[];

  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    const currentKey = configService.get<string>('auth.totp.encryptionKey') || process.env.TOTP_ENCRYPTION_KEY;
    const previousKeys = configService.get<string[]>('auth.totp.previousEncryptionKeys') ||
      process.env.TOTP_PREVIOUS_ENCRYPTION_KEYS?.split(',').map((key) => key.trim()).filter(Boolean) || [];
    const legacySecret = configService.get<string>('jwt.secret') || process.env.JWT_SECRET;
    const configuredKeys = [currentKey, ...previousKeys].filter((key): key is string => Boolean(key));
    if (configuredKeys.length === 0) {
      throw new Error('TOTP_ENCRYPTION_KEY is required to protect 2FA credentials');
    }
    this.encryptionKeys = [
      ...configuredKeys.map((key) => Buffer.from(createHmac('sha256', key).update('codeplatform:totp:v1').digest())),
      ...(legacySecret ? [Buffer.from(createHmac('sha256', legacySecret).update('codeplatform:totp:v1').digest())] : []),
    ];
  }

  /**
   * Generates a new TOTP secret, QR code data URL, and 8 one-time recovery backup codes
   */
  async generateSecret(userId: string, email: string): Promise<TotpSetupResponse> {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: this.appName,
      label: email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate 8 cryptographically secure 8-character backup codes
    const recoveryCodes: string[] = [];
    for (let i = 0; i < 8; i++) {
      recoveryCodes.push(randomBytes(4).toString('hex').toUpperCase());
    }

    return {
      secret,
      qrCodeDataUrl,
      otpauthUrl,
      recoveryCodes,
    };
  }

  /**
   * Enables TOTP 2FA on the user's account after verifying the first valid token
   */
  async enable2FA(
    userId: string,
    secret: string,
    token: string,
    recoveryCodes: string[],
  ): Promise<boolean> {
    const result = verifySync({ token, secret, epochTolerance: 30 });
    if (!result.valid) {
      throw new BadRequestException('Invalid 6-digit verification code. Please try again.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: this.encrypt(secret),
        twoFactorRecoveryCodes: recoveryCodes.map((code) => this.hashRecoveryCode(code)),
      },
    });

    return true;
  }

  /**
   * Verifies a 6-digit TOTP token or 8-character backup recovery code for authentication
   */
  async verify2FA(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorRecoveryCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor authentication is not enabled for this user.');
    }

    // Check if token matches standard 6-digit TOTP
    const decrypted = this.decrypt(user.twoFactorSecret);
    const result = verifySync({ token: code, secret: decrypted.value, epochTolerance: 30 });

    if (result.valid) {
      if (decrypted.legacy) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { twoFactorSecret: this.encrypt(decrypted.value) },
        });
      }
      return true;
    }

    // Check if code matches an unused backup recovery code atomically inside a transaction
    const normalizedCode = code.trim().toUpperCase();
    const consumeRecoveryCode = () => this.prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: userId },
        select: { twoFactorRecoveryCodes: true },
      });

      if (!freshUser) {
        return false;
      }

      const codeIndex = freshUser.twoFactorRecoveryCodes.findIndex((storedCode) =>
        this.matchesRecoveryCode(storedCode, normalizedCode),
      );
      if (codeIndex === -1) {
        return false;
      }

      const updatedCodes = [...freshUser.twoFactorRecoveryCodes];
      updatedCodes.splice(codeIndex, 1);
      const upgradedCodes = updatedCodes.map((storedCode) =>
        storedCode.startsWith('hmac:v1:') ? storedCode : this.hashRecoveryCode(storedCode),
      );

      await tx.user.update({
        where: { id: userId },
        data: {
          twoFactorRecoveryCodes: upgradedCodes,
        },
      });

      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    let consumed = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        consumed = await consumeRecoveryCode();
        break;
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034' || attempt === 2) {
          throw error;
        }
      }
    }

    if (consumed) {
      return true;
    }

    throw new UnauthorizedException('Invalid 2FA code or backup recovery code.');
  }

  /**
   * Disables TOTP 2FA for a user
   */
  async disable2FA(userId: string, token: string): Promise<boolean> {
    await this.verify2FA(userId, token);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
      },
    });

    return true;
  }

  private encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKeys[0], iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `enc:v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
  }

  private decrypt(value: string): { value: string; legacy: boolean } {
    // Legacy values are supported temporarily so existing developers can sign in;
    // newly enabled 2FA credentials are always encrypted.
    if (!value.startsWith('enc:v1:')) return { value, legacy: true };
    const [, , iv, tag, encrypted] = value.split(':');
    for (let index = 0; index < this.encryptionKeys.length; index++) {
      try {
        const decipher = createDecipheriv('aes-256-gcm', this.encryptionKeys[index], Buffer.from(iv, 'base64url'));
        decipher.setAuthTag(Buffer.from(tag, 'base64url'));
        return {
          value: Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8'),
          legacy: index !== 0,
        };
      } catch {
        continue;
      }
    }
    throw new UnauthorizedException('Unable to decrypt two-factor credentials');
  }

  private hashRecoveryCode(code: string): string {
    return `hmac:v1:${createHmac('sha256', this.encryptionKeys[0]).update(code.trim().toUpperCase()).digest('base64url')}`;
  }

  private matchesRecoveryCode(storedCode: string, candidate: string): boolean {
    if (!storedCode.startsWith('hmac:v1:')) return storedCode === candidate;
    const expected = Buffer.from(storedCode.slice('hmac:v1:'.length));
    return this.encryptionKeys.some((key) => {
      const actual = Buffer.from(createHmac('sha256', key).update(candidate).digest('base64url'));
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    });
  }
}
