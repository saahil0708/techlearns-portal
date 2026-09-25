import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { TokenService, type TokenPair } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private firebaseApp: App | null = null;

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private totpService: TotpService,
    private webAuthnService: WebAuthnService,
    @Optional() private configService?: ConfigService,
  ) {}

  private getFirebaseAdmin(): App {
    const apps = getApps();
    if (apps.length > 0 && apps[0]) {
      return apps[0];
    }

    const projectId =
      this.configService?.get<string>('FIREBASE_PROJECT_ID') ||
      process.env.FIREBASE_PROJECT_ID ||
      'techlearns-portal-22ff4';
    const clientEmail =
      this.configService?.get<string>('FIREBASE_CLIENT_EMAIL') ||
      process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey =
      this.configService?.get<string>('FIREBASE_PRIVATE_KEY') ||
      process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      this.firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.firebaseApp = initializeApp({
        projectId,
      });
    }

    return this.firebaseApp;
  }

  async verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
    const app = this.getFirebaseAdmin();
    return getAuth(app).verifyIdToken(idToken);
  }

  /**
   * Authenticate user via Firebase OAuth (Google, GitHub, etc.)
   */
  async oauthLogin(
    idToken: string,
    provider?: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;

    try {
      const decoded = await this.verifyFirebaseToken(idToken);
      email = decoded.email;
      name = decoded.name;
      picture = decoded.picture;
    } catch (err: any) {
      this.logger.warn(`Firebase token verification failed for provider ${provider}: ${err.message}`);
      throw new UnauthorizedException(`OAuth token verification failed: ${err.message}`);
    }

    if (!email) {
      throw new BadRequestException('Email was not provided by the OAuth provider');
    }

    const normalizedEmail = email.toLowerCase();
    let user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Your account is inactive or suspended');
      }

      // If user has no avatar and picture exists, update avatar
      if (!user.avatarUrl && picture) {
        await this.usersService.updateUser(user.id, { avatarUrl: picture });
      }
    } else {
      // Create new user account with high-entropy randomized password hash
      const randomSecret = randomBytes(32).toString('hex');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(randomSecret, saltRounds);
      const displayName = name || normalizedEmail.split('@')[0] || 'User';

      await this.usersService.createUser({
        email: normalizedEmail,
        name: displayName,
        passwordHash,
        avatarUrl: picture,
      });

      user = await this.usersService.findByEmail(normalizedEmail);
      if (!user) {
        throw new UnauthorizedException('Failed to initialize user from OAuth profile');
      }
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

  async acceptInvitation(token: string, password: string, deviceInfo?: string, ipAddress?: string) {
    const user = await this.usersService.acceptInvitation(token, password);
    try {
      const tokens = await this.tokenService.generateTokenPair(
        user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress,
      );
      return { user, tokens, requiresLogin: false };
    } catch {
      return {
        user,
        tokens: undefined,
        requiresLogin: true,
        message: 'Account activated successfully. Please log in to continue.',
      };
    }
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
      const challengeToken = await this.tokenService.generate2faChallengeToken(user.id);
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
      resolvedUserId = await this.tokenService.verify2faChallengeToken(target.challengeToken);
    } else {
      throw new UnauthorizedException('A valid 2FA challenge token is required.');
    }

    await this.totpService.verify2FA(resolvedUserId, code);
    await this.tokenService.consume2faChallengeToken(target.challengeToken!, resolvedUserId);

    const user = await this.usersService.findById(resolvedUserId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is inactive or suspended');
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

    const user = await this.usersService.findById(result.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is inactive or suspended');
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

  /**
   * Change user password securely with current password validation
   */
  async changePassword(userId: string, currentPass: string, newPass: string) {
    return this.usersService.changePassword(userId, currentPass, newPass);
  }
}
