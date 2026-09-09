import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { TokenService, type TokenPair } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private totpService: TotpService,
    private webAuthnService: WebAuthnService,
  ) {}

  /**
   * Register a new user with strong password hashing and initial token pair
   */
  async register(dto: RegisterDto, deviceInfo?: string, ipAddress?: string) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const saltRounds = 12; // High-security bcrypt rounds
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.globalRole,
      undefined,
      deviceInfo,
      ipAddress,
    );

    const sanitizedUser = await this.usersService.findById(user.id);

    return {
      user: sanitizedUser,
      tokens,
    };
  }

  /**
   * Log in with password verification. If 2FA is active, triggers 2FA challenge flow.
   */
  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is inactive or suspended');
    }

    // If 2FA is enabled on this account, return 2FA challenge requirement with signed temporary challenge token
    if (user.twoFactorEnabled) {
      const challengeToken = this.tokenService.generate2faChallengeToken(user.id);
      return {
        requires2FA: true,
        challengeToken,
        userId: user.id,
        message: 'Please enter your 6-digit Authenticator code or recovery backup code.',
      };
    }

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.globalRole,
      undefined,
      deviceInfo,
      ipAddress,
    );

    const sanitizedUser = await this.usersService.findById(user.id);

    return {
      user: sanitizedUser,
      tokens,
    };
  }

  /**
   * Completes 2FA challenge login and issues authenticated token pair
   */
  async verify2faLogin(
    target: { challengeToken?: string; userId?: string },
    code: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    let resolvedUserId: string;

    if (target.challengeToken) {
      resolvedUserId = this.tokenService.verify2faChallengeToken(target.challengeToken);
    } else if (target.userId) {
      resolvedUserId = target.userId;
    } else {
      throw new UnauthorizedException('Either challengeToken or userId must be provided.');
    }

    await this.totpService.verify2FA(resolvedUserId, code);

    const user = await this.usersService.findById(resolvedUserId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.globalRole,
      undefined,
      deviceInfo,
      ipAddress,
    );

    return {
      user,
      tokens,
    };
  }

  /**
   * Passwordless Login with Passkey / Physical Security Key verification
   */
  async verifyPasskeyLogin(response: any, challengeKey: string, deviceInfo?: string, ipAddress?: string) {
    const result = await this.webAuthnService.verifyPasskeyLogin(response, challengeKey);

    const tokens = await this.tokenService.generateTokenPair(
      result.userId,
      result.email,
      result.globalRole,
      undefined,
      deviceInfo,
      ipAddress,
    );

    const user = await this.usersService.findById(result.userId);

    return {
      user,
      tokens,
    };
  }

  /**
   * Rotate refresh token (RTR)
   */
  async refreshTokens(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<TokenPair> {
    return this.tokenService.rotateRefreshToken(refreshToken, deviceInfo, ipAddress);
  }

  /**
   * Log out active session
   */
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.tokenService.revokeToken(refreshToken);
    return { success: true };
  }

  /**
   * Log out all active sessions for a user
   */
  async logoutAll(userId: string): Promise<{ success: boolean }> {
    await this.tokenService.revokeAllUserSessions(userId);
    return { success: true };
  }

  /**
   * Get user profile details
   */
  async getProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }
}
