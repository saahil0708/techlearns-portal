import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class TokenService {
    private prisma;
    private jwtService;
    private configService;
    private readonly jwtSecret;
    private readonly accessTokenTtl;
    private readonly refreshTokenTtlDays;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    generateAccessToken(userId: string, email: string, globalRole: string): string;
    generate2faChallengeToken(userId: string): Promise<string>;
    verify2faChallengeToken(challengeToken: string): Promise<string>;
    consume2faChallengeToken(challengeToken: string, userId: string): Promise<void>;
    generateTokenPair(userId: string, email: string, globalRole: string, familyId?: string, deviceInfo?: string, ipAddress?: string): Promise<TokenPair>;
    rotateRefreshToken(rawRefreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<TokenPair>;
    revokeToken(rawRefreshToken: string): Promise<void>;
    revokeAllUserSessions(userId: string): Promise<void>;
    private hashToken;
    private parseAccessTokenTtl;
}
