var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto, RevokeTokenDto } from './dto/refresh-token.dto.js';
import { Disable2faDto, Enable2faDto, Verify2faDto } from './dto/totp.dto.js';
import { PasskeyLoginChallengeDto, PasskeyLoginVerifyDto, PasskeyRegistrationVerifyDto, } from './dto/passkey.dto.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
let AuthController = class AuthController {
    authService;
    totpService;
    webAuthnService;
    constructor(authService, totpService, webAuthnService) {
        this.authService = authService;
        this.totpService = totpService;
        this.webAuthnService = webAuthnService;
    }
    setAuthCookies(res, tokens) {
        if (!tokens || !res || typeof res.cookie !== 'function')
            return;
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    }
    clearAuthCookies(res) {
        if (!res || typeof res.clearCookie !== 'function')
            return;
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOpts = {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'strict' : 'lax'),
            path: '/',
        };
        res.clearCookie('access_token', cookieOpts);
        res.clearCookie('refresh_token', cookieOpts);
    }
    async register(dto, req, res) {
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.register(dto, deviceInfo, ipAddress);
        this.setAuthCookies(res, result.tokens);
        return result;
    }
    async acceptInvitation(dto, req, res) {
        const result = await this.authService.acceptInvitation(dto.token, dto.password, req.headers['user-agent'], req.ip);
        this.setAuthCookies(res, result.tokens);
        return result;
    }
    async login(dto, req, res) {
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.login(dto, deviceInfo, ipAddress);
        if ('tokens' in result && result.tokens) {
            this.setAuthCookies(res, result.tokens);
        }
        return result;
    }
    async refreshTokens(dto, req, res) {
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
    async logout(dto, req, res) {
        const token = dto.refreshToken || req.cookies?.['refresh_token'] || req.cookies?.['refreshToken'];
        if (token) {
            await this.authService.logout(token);
        }
        this.clearAuthCookies(res);
        return { success: true, message: 'Logged out successfully' };
    }
    async logoutAll(user, res) {
        this.clearAuthCookies(res);
        return this.authService.logoutAll(user.id);
    }
    async generate2faSecret(user) {
        return this.totpService.generateSecret(user.id, user.email);
    }
    async enable2fa(user, dto) {
        return this.totpService.enable2FA(user.id, dto.secret, dto.token, dto.recoveryCodes);
    }
    async verify2faLogin(dto, req, res) {
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.verify2faLogin({ challengeToken: dto.challengeToken }, dto.code, deviceInfo, ipAddress);
        this.setAuthCookies(res, result.tokens);
        return result;
    }
    async disable2fa(user, dto) {
        return this.totpService.disable2FA(user.id, dto.token);
    }
    async generatePasskeyRegistrationChallenge(user) {
        return this.webAuthnService.generatePasskeyRegistrationOptions(user.id);
    }
    async verifyPasskeyRegistration(user, dto) {
        return this.webAuthnService.verifyPasskeyRegistration(user.id, dto.response, dto.deviceName);
    }
    async generatePasskeyLoginChallenge(dto) {
        return this.webAuthnService.generatePasskeyLoginOptions(dto.email);
    }
    async verifyPasskeyLogin(dto, req, res) {
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.verifyPasskeyLogin(dto.response, dto.challengeKey, deviceInfo, ipAddress);
        this.setAuthCookies(res, result.tokens);
        return result;
    }
    async listPasskeys(user) {
        return this.webAuthnService.listUserPasskeys(user.id);
    }
    async deletePasskey(user, id) {
        return this.webAuthnService.deletePasskey(user.id, id);
    }
    async getProfile(user) {
        return this.authService.getProfile(user.id);
    }
    async changePassword(user, dto) {
        return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    }
};
__decorate([
    Public(),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    Post('register'),
    ApiOperation({ summary: 'Register a new user account with high-security password hashing' }),
    ApiResponse({ status: 201, description: 'User created successfully with token pair' }),
    ApiResponse({ status: 409, description: 'User with this email already exists' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    Post('accept-invitation'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Activate a one-time user invitation and set an account password' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AcceptInvitationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvitation", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    Post('login'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Log in with email and password (triggers 2FA challenge if enabled)' }),
    ApiResponse({ status: 200, description: 'Logged in successfully or 2FA challenge initiated' }),
    ApiResponse({ status: 401, description: 'Invalid email or password' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Rotate refresh token (RTR) with token theft & reuse detection' }),
    ApiResponse({ status: 200, description: 'New token pair issued successfully' }),
    ApiResponse({ status: 401, description: 'Invalid, revoked, or expired refresh token' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    Public(),
    Post('logout'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Log out current session by revoking the active refresh token' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RevokeTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Post('logout-all'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Log out all active sessions across all devices for this user' }),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    Post('2fa/generate'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Generate TOTP secret, QR code URI, and backup recovery codes' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generate2faSecret", null);
__decorate([
    Post('2fa/enable'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Confirm and enable 2FA on account using a valid 6-digit token' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Enable2faDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2fa", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    Post('2fa/verify'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Verify 2FA token or backup recovery code during login challenge' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Verify2faDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2faLogin", null);
__decorate([
    Post('2fa/disable'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Disable 2FA on account by confirming current 6-digit token' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Disable2faDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2fa", null);
__decorate([
    Post('passkey/register-challenge'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Generate WebAuthn challenge for registering a physical security key' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generatePasskeyRegistrationChallenge", null);
__decorate([
    Post('passkey/register-verify'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Verify physical security key signature and register credential' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PasskeyRegistrationVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPasskeyRegistration", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    Post('passkey/login-challenge'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Generate WebAuthn challenge for passwordless physical key login' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PasskeyLoginChallengeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generatePasskeyLoginChallenge", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    Post('passkey/login-verify'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Verify physical security key signature and authenticate session' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PasskeyLoginVerifyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPasskeyLogin", null);
__decorate([
    Get('passkeys'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'List all registered physical security keys & passkeys for user' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listPasskeys", null);
__decorate([
    Delete('passkeys/:id'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Remove a registered physical security key' }),
    __param(0, CurrentUser()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deletePasskey", null);
__decorate([
    Get('me'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get profile details of the current authenticated user' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    Post('change-password'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Change user account password securely' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
AuthController = __decorate([
    ApiTags('auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        TotpService,
        WebAuthnService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map