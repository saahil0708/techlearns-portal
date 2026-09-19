var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse, } from '@simplewebauthn/server';
import { PrismaService } from '../../prisma/prisma.service.js';
let WebAuthnService = class WebAuthnService {
    prisma;
    configService;
    rpName = 'CodePlatform Enterprise';
    rpId;
    expectedOrigin;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.rpId = this.configService.get('auth.webauthn.rpId') || 'localhost';
        this.expectedOrigin =
            this.configService.get('auth.webauthn.origin') || 'http://localhost:3000';
    }
    async saveChallenge(key, challenge) {
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.webAuthnChallenge.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        await this.prisma.webAuthnChallenge.upsert({
            where: { key },
            update: { challenge, expiresAt },
            create: { key, challenge, expiresAt },
        });
    }
    async consumeChallenge(key) {
        const rows = await this.prisma.$queryRaw(Prisma.sql `
        DELETE FROM "webauthn_challenges"
        WHERE "key" = ${key} AND "expiresAt" > NOW()
        RETURNING "challenge"
      `);
        return rows[0]?.challenge || null;
    }
    async generatePasskeyRegistrationOptions(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { passkeys: true },
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const excludeCredentials = user.passkeys.map((passkey) => ({
            id: passkey.credentialId,
            transports: passkey.transports,
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
        await this.saveChallenge(`reg:${userId}`, options.challenge);
        return options;
    }
    async verifyPasskeyRegistration(userId, response, deviceName) {
        const challenge = await this.consumeChallenge(`reg:${userId}`);
        if (!challenge) {
            throw new BadRequestException('Passkey registration challenge expired. Please retry.');
        }
        let verification;
        try {
            verification = await verifyRegistrationResponse({
                response,
                expectedChallenge: challenge,
                expectedOrigin: this.expectedOrigin,
                expectedRPID: this.rpId,
            });
        }
        catch (err) {
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
    async generatePasskeyLoginOptions(email) {
        let allowCredentials = undefined;
        if (email) {
            const user = await this.prisma.user.findUnique({
                where: { email },
                include: { passkeys: true },
            });
            if (user && user.passkeys.length > 0) {
                allowCredentials = user.passkeys.map((p) => ({
                    id: p.credentialId,
                    transports: p.transports,
                }));
            }
        }
        const options = await generateAuthenticationOptions({
            rpID: this.rpId,
            allowCredentials,
            userVerification: 'preferred',
        });
        const sessionKey = `auth:${randomUUID()}`;
        await this.saveChallenge(sessionKey, options.challenge);
        return { ...options, challengeKey: sessionKey };
    }
    async verifyPasskeyLogin(response, challengeKey) {
        const challenge = await this.consumeChallenge(challengeKey);
        if (!challenge) {
            throw new UnauthorizedException('Authentication challenge expired. Please retry.');
        }
        const credentialId = response.id;
        const passkey = await this.prisma.passkeyCredential.findUnique({
            where: { credentialId },
            include: { user: true },
        });
        if (!passkey) {
            throw new UnauthorizedException('Unrecognized security key. Please use a registered device.');
        }
        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response,
                expectedChallenge: challenge,
                expectedOrigin: this.expectedOrigin,
                expectedRPID: this.rpId,
                credential: {
                    id: passkey.credentialId,
                    publicKey: new Uint8Array(passkey.publicKey),
                    counter: Number(passkey.counter),
                    transports: passkey.transports,
                },
            });
        }
        catch (err) {
            throw new UnauthorizedException(`Security key verification failed: ${err?.message || 'Invalid signature'}`);
        }
        const { verified, authenticationInfo } = verification;
        if (!verified || !authenticationInfo) {
            throw new UnauthorizedException('Physical security key signature verification failed.');
        }
        const storedCounter = Number(passkey.counter);
        if (storedCounter > 0 && authenticationInfo.newCounter <= storedCounter) {
            throw new UnauthorizedException('Replay attack detected: Authenticator counter did not advance.');
        }
        const counterUpdate = await this.prisma.passkeyCredential.updateMany({
            where: {
                id: passkey.id,
                counter: BigInt(storedCounter),
            },
            data: {
                counter: BigInt(authenticationInfo.newCounter),
                lastUsedAt: new Date(),
            },
        });
        if (counterUpdate.count !== 1) {
            throw new UnauthorizedException('Replay attack detected: authenticator counter changed concurrently.');
        }
        return {
            verified: true,
            userId: passkey.user.id,
            email: passkey.user.email,
            globalRole: passkey.user.globalRole,
        };
    }
    async listUserPasskeys(userId) {
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
    async deletePasskey(userId, passkeyId) {
        await this.prisma.passkeyCredential.deleteMany({
            where: { id: passkeyId, userId },
        });
        return { success: true };
    }
};
WebAuthnService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], WebAuthnService);
export { WebAuthnService };
//# sourceMappingURL=webauthn.service.js.map