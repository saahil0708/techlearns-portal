import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto, RevokeTokenDto } from './dto/refresh-token.dto.js';
import { Disable2faDto, Enable2faDto, Verify2faDto } from './dto/totp.dto.js';
import {
  PasskeyLoginChallengeDto,
  PasskeyLoginVerifyDto,
  PasskeyRegistrationVerifyDto,
} from './dto/passkey.dto.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private totpService: TotpService,
    private webAuthnService: WebAuthnService,
  ) {}

  /**
   * Helper to set high-security httpOnly SameSite cookies on browser responses
   */
  private setAuthCookies(res: Response, tokens?: { accessToken: string; refreshToken: string }) {
    if (!tokens || !res || typeof res.cookie !== 'function') return;

    const isProd = process.env.NODE_ENV === 'production';

    // 24 hours for access token
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 30 days for refresh token
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Helper to clear auth cookies on logout
   */
  private clearAuthCookies(res: Response) {
    if (!res || typeof res.clearCookie !== 'function') return;

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'strict' : 'lax') as any,
      path: '/',
    };

    res.clearCookie('access_token', cookieOpts);
    res.clearCookie('refresh_token', cookieOpts);
  }

  // ==========================================
  // STANDARD CREDENTIALS & DUAL-TOKEN (RTR)
  // ==========================================

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account with high-security password hashing' })
  @ApiResponse({ status: 201, description: 'User created successfully with token pair' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await this.authService.register(dto, deviceInfo, ipAddress);
    this.setAuthCookies(res, result.tokens);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a one-time user invitation and set an account password' })
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.acceptInvitation(dto.token, dto.password, req.headers['user-agent'], req.ip);
    this.setAuthCookies(res, result.tokens);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password (triggers 2FA challenge if enabled)' })
  @ApiResponse({ status: 200, description: 'Logged in successfully or 2FA challenge initiated' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await this.authService.login(dto, deviceInfo, ipAddress);
    if ('tokens' in result && result.tokens) {
      this.setAuthCookies(res, result.tokens);
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token (RTR) with token theft & reuse detection' })
  @ApiResponse({ status: 200, description: 'New token pair issued successfully' })
  @ApiResponse({ status: 401, description: 'Invalid, revoked, or expired refresh token' })
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = dto.refreshToken || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];
    if (!token) {
      throw new UnauthorizedException('No refresh token provided in request body or httpOnly cookie.');
    }

    const deviceInfo = dto.deviceInfo || req.headers['user-agent'];
    const ipAddress = req.ip;
    const tokens = await this.authService.refreshTokens(token, deviceInfo, ipAddress);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out current session by revoking the active refresh token' })
  async logout(
    @Body() dto: RevokeTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = dto.refreshToken || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];
    if (token) {
      await this.authService.logout(token);
    }
    this.clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out all active sessions across all devices for this user' })
  async logoutAll(
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.clearAuthCookies(res);
    return this.authService.logoutAll(user.id);
  }


  // ==========================================
  // TOTP TWO-FACTOR AUTHENTICATION (2FA)
  // ==========================================

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate TOTP secret, QR code URI, and backup recovery codes' })
  async generate2faSecret(@CurrentUser() user: CurrentUserPayload) {
    return this.totpService.generateSecret(user.id, user.email);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm and enable 2FA on account using a valid 6-digit token' })
  async enable2fa(@CurrentUser() user: CurrentUserPayload, @Body() dto: Enable2faDto) {
    return this.totpService.enable2FA(user.id, dto.secret, dto.token, dto.recoveryCodes);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA token or backup recovery code during login challenge' })
  async verify2faLogin(
    @Body() dto: Verify2faDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await this.authService.verify2faLogin(
      { challengeToken: dto.challengeToken },
      dto.code,
      deviceInfo,
      ipAddress,
    );
    this.setAuthCookies(res, result.tokens);
    return result;
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disable 2FA on account by confirming current 6-digit token' })
  async disable2fa(@CurrentUser() user: CurrentUserPayload, @Body() dto: Disable2faDto) {
    return this.totpService.disable2FA(user.id, dto.token);
  }

  // ==========================================
  // FIDO2 / WEBAUTHN / PHYSICAL SECURITY KEYS
  // ==========================================

  @Post('passkey/register-challenge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate WebAuthn challenge for registering a physical security key' })
  async generatePasskeyRegistrationChallenge(@CurrentUser() user: CurrentUserPayload) {
    return this.webAuthnService.generatePasskeyRegistrationOptions(user.id);
  }

  @Post('passkey/register-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify physical security key signature and register credential' })
  async verifyPasskeyRegistration(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: PasskeyRegistrationVerifyDto,
  ) {
    return this.webAuthnService.verifyPasskeyRegistration(user.id, dto.response, dto.deviceName);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('passkey/login-challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate WebAuthn challenge for passwordless physical key login' })
  async generatePasskeyLoginChallenge(@Body() dto: PasskeyLoginChallengeDto) {
    return this.webAuthnService.generatePasskeyLoginOptions(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('passkey/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify physical security key signature and authenticate session' })
  async verifyPasskeyLogin(
    @Body() dto: PasskeyLoginVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await this.authService.verifyPasskeyLogin(dto.response, dto.challengeKey, deviceInfo, ipAddress);
    this.setAuthCookies(res, result.tokens);
    return result;
  }

  @Get('passkeys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all registered physical security keys & passkeys for user' })
  async listPasskeys(@CurrentUser() user: CurrentUserPayload) {
    return this.webAuthnService.listUserPasskeys(user.id);
  }

  @Delete('passkeys/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a registered physical security key' })
  async deletePasskey(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.webAuthnService.deletePasskey(user.id, id);
  }

  // ==========================================
  // PROFILE & IDENTITY RESOLUTION
  // ==========================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get profile details of the current authenticated user' })
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user account password securely' })
  async changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
