var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
let TokenService = class TokenService {
    prisma;
    jwtService;
    configService;
    jwtSecret;
    accessTokenTtl;
    refreshTokenTtlDays = 30;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const secret = this.configService.get('jwt.secret') || process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment');
        }
        this.jwtSecret = secret || 'default-jwt-secret-key-change-in-production';
        this.accessTokenTtl = this.parseAccessTokenTtl(this.configService.get('jwt.expiresIn') || '1d');
    }
    generateAccessToken(userId, email, globalRole) {
        const payload = {
            sub: userId,
            email,
            globalRole,
        };
        return this.jwtService.sign(payload, {
            expiresIn: this.accessTokenTtl,
        });
    }
    async generate2faChallengeToken(userId) {
        const jti = randomUUID();
        await this.prisma.twoFactorChallenge.deleteMany({
            where: { expiresAt: { lte: new Date() } },
        });
        await this.prisma.twoFactorChallenge.create({
            data: {
                jti,
                userId,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        return this.jwtService.sign({ sub: userId, type: '2FA_CHALLENGE', jti }, { expiresIn: '5m' });
    }
    async verify2faChallengeToken(challengeToken) {
        try {
            const payload = this.jwtService.verify(challengeToken);
            if (payload.type !== '2FA_CHALLENGE' || !payload.sub || !payload.jti) {
                throw new UnauthorizedException('Invalid 2FA challenge token.');
            }
            const challenge = await this.prisma.twoFactorChallenge.findFirst({
                where: {
                    jti: payload.jti,
                    userId: payload.sub,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!challenge) {
                throw new UnauthorizedException('2FA challenge token has already been used or expired.');
            }
            return payload.sub;
        }
        catch {
            throw new UnauthorizedException('2FA challenge token has expired or is invalid. Please log in again.');
        }
    }
    async consume2faChallengeToken(challengeToken, userId) {
        try {
            const payload = this.jwtService.verify(challengeToken);
            if (payload.type !== '2FA_CHALLENGE' || payload.sub !== userId || !payload.jti) {
                throw new UnauthorizedException('Invalid 2FA challenge token.');
            }
            const consumed = await this.prisma.twoFactorChallenge.deleteMany({
                where: {
                    jti: payload.jti,
                    userId,
                    expiresAt: { gt: new Date() },
                },
            });
            if (consumed.count !== 1) {
                throw new UnauthorizedException('2FA challenge token has already been used or expired.');
            }
        }
        catch (error) {
            if (error instanceof UnauthorizedException)
                throw error;
            throw new UnauthorizedException('2FA challenge token has expired or is invalid. Please log in again.');
        }
    }
    async generateTokenPair(userId, email, globalRole, familyId, deviceInfo, ipAddress) {
        const accessToken = this.generateAccessToken(userId, email, globalRole);
        const rawRefreshToken = randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(rawRefreshToken);
        const family = familyId || randomUUID();
        const expiresAt = new Date(Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                family,
                expiresAt,
                deviceInfo: deviceInfo || null,
                ipAddress: ipAddress || null,
            },
        });
        return {
            accessToken,
            refreshToken: rawRefreshToken,
            expiresIn: this.accessTokenTtl,
        };
    }
    async rotateRefreshToken(rawRefreshToken, deviceInfo, ipAddress) {
        const tokenHash = this.hashToken(rawRefreshToken);
        const existingToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!existingToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
        const updateResult = await this.prisma.refreshToken.updateMany({
            where: {
                id: existingToken.id,
                isRevoked: false,
            },
            data: { isRevoked: true },
        });
        if (updateResult.count === 0) {
            await this.prisma.refreshToken.updateMany({
                where: { family: existingToken.family },
                data: { isRevoked: true },
            });
            throw new UnauthorizedException('Token reuse detected. All sessions in this token family have been revoked for your security.');
        }
        if (new Date() > existingToken.expiresAt) {
            throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
        }
        if (existingToken.user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User account is inactive or suspended.');
        }
        return this.generateTokenPair(existingToken.user.id, existingToken.user.email, existingToken.user.globalRole, existingToken.family, deviceInfo, ipAddress);
    }
    async revokeToken(rawRefreshToken) {
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { isRevoked: true },
        });
    }
    async revokeAllUserSessions(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
    }
    hashToken(token) {
        return createHash('sha256').update(token).digest('hex');
    }
    parseAccessTokenTtl(value) {
        const match = /^(\d+)\s*([smhd]?)$/i.exec(value.trim());
        if (!match)
            return 24 * 60 * 60;
        const amount = Number(match[1]);
        const multiplier = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 }[(match[2] || 's').toLowerCase()];
        const ttl = amount * multiplier;
        return amount > 0 && Number.isSafeInteger(amount) &&
            Number.isSafeInteger(ttl) && ttl > 0
            ? ttl
            : 24 * 60 * 60;
    }
};
TokenService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService])
], TokenService);
export { TokenService };
//# sourceMappingURL=token.service.js.map