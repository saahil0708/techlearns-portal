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
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtlDays = 30; // 30 days

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('jwt.secret') || process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment');
    }
    this.jwtSecret = secret || 'default-jwt-secret-key-change-in-production';
    this.accessTokenTtl = this.parseAccessTokenTtl(
      this.configService.get<string>('jwt.expiresIn') || '1d',
    );
  }

  /**
   * Generates a signed Access Token
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
  async generate2faChallengeToken(userId: string): Promise<string> {
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
    return this.jwtService.sign(
      { sub: userId, type: '2FA_CHALLENGE', jti },
      { expiresIn: '5m' },
    );
  }

  /**
   * Verifies a 2FA challenge token without consuming it, allowing a user to
   * retry after an invalid TOTP code.
   */
  async verify2faChallengeToken(challengeToken: string): Promise<string> {
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
    } catch {
      throw new UnauthorizedException('2FA challenge token has expired or is invalid. Please log in again.');
    }
  }

  /** Consumes a challenge after its TOTP/recovery code has been validated. */
  async consume2faChallengeToken(challengeToken: string, userId: string): Promise<void> {
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
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
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

    // Atomically attempt to revoke the token (CAS: only if isRevoked is false)
    const updateResult = await this.prisma.refreshToken.updateMany({
      where: {
        id: existingToken.id,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    // If update count is 0, the token was already revoked (or rotated concurrently by another request)
    // Trigger emergency token family revocation for security
    if (updateResult.count === 0) {
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
      throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
    }

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

  private parseAccessTokenTtl(value: string): number {
    const match = /^(\d+)\s*([smhd]?)$/i.exec(value.trim());
    if (!match) return 24 * 60 * 60;

    const amount = Number(match[1]);
    const multiplier = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 }[
      (match[2] || 's').toLowerCase() as 's' | 'm' | 'h' | 'd'
    ];
    const ttl = amount * multiplier;
    return amount > 0 && Number.isSafeInteger(amount) &&
      Number.isSafeInteger(ttl) && ttl > 0
      ? ttl
      : 24 * 60 * 60;
  }
}
