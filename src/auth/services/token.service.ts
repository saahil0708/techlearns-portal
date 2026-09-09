import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;
  private readonly accessTokenTtl = 24 * 60 * 60; // 24 hours in seconds
  private readonly refreshTokenTtlDays = 30; // 30 days

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('jwt.secret') || 'default-jwt-secret-key-change-in-production';
  }

  /**
   * Generates a signed Access Token (JWT 15m)
   */
  generateAccessToken(userId: string, email: string, globalRole: string): string {
    const payload = {
      sub: userId,
      email,
      globalRole,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenTtl,
    });
  }

  /**
   * Generates a short-lived (5m) signed challenge token when 2FA is required during login
   */
  generate2faChallengeToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: '2FA_CHALLENGE' },
      { expiresIn: '5m' },
    );
  }

  /**
   * Verifies and decodes a 2FA challenge token
   */
  verify2faChallengeToken(challengeToken: string): string {
    try {
      const payload = this.jwtService.verify(challengeToken);
      if (payload.type !== '2FA_CHALLENGE' || !payload.sub) {
        throw new UnauthorizedException('Invalid 2FA challenge token.');
      }
      return payload.sub;
    } catch {
      throw new UnauthorizedException('2FA challenge token has expired or is invalid. Please log in again.');
    }
  }


  /**
   * Generates and registers a new Refresh Token in the database with a token family UUID
   */
  async generateTokenPair(
    userId: string,
    email: string,
    globalRole: string,
    familyId?: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
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

  /**
   * Rotates a Refresh Token (RTR) with Automatic Token Family Invalidation (Theft Detection)
   */
  async rotateRefreshToken(
    rawRefreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Reuse Detection: If an already revoked token is used, trigger emergency family revocation
    if (existingToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { family: existingToken.family },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Token reuse detected. All sessions in this token family have been revoked for your security.',
      );
    }

    // Check expiration
    if (new Date() > existingToken.expiresAt) {
      await this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
    }

    // Revoke the old token (one-time use)
    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });

    // Check if user is active
    if (existingToken.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive or suspended.');
    }

    // Generate new rotated token pair within the same token family
    return this.generateTokenPair(
      existingToken.user.id,
      existingToken.user.email,
      existingToken.user.globalRole,
      existingToken.family,
      deviceInfo,
      ipAddress,
    );
  }

  /**
   * Revokes a specific active refresh token (Logout)
   */
  async revokeToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Revokes all active refresh tokens for a user (Global Logout / Password Change)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * SHA-256 cryptographic hash for safe token indexing
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
