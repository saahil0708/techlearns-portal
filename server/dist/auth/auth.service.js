var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, UnauthorizedException, } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { TokenService } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
let AuthService = class AuthService {
    usersService;
    tokenService;
    totpService;
    webAuthnService;
    constructor(usersService, tokenService, totpService, webAuthnService) {
        this.usersService = usersService;
        this.tokenService = tokenService;
        this.totpService = totpService;
        this.webAuthnService = webAuthnService;
    }
    async register(dto, deviceInfo, ipAddress) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('A user with this email address already exists');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);
        const user = await this.usersService.createUser({
            email: dto.email,
            name: dto.name,
            passwordHash,
        });
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress);
        const sanitizedUser = await this.usersService.findById(user.id);
        return {
            user: sanitizedUser,
            tokens,
        };
    }
    async acceptInvitation(token, password, deviceInfo, ipAddress) {
        const user = await this.usersService.acceptInvitation(token, password);
        try {
            const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress);
            return { user, tokens, requiresLogin: false };
        }
        catch {
            return {
                user,
                tokens: undefined,
                requiresLogin: true,
                message: 'Account activated successfully. Please log in to continue.',
            };
        }
    }
    async login(dto, deviceInfo, ipAddress) {
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
        if (user.twoFactorEnabled) {
            const challengeToken = await this.tokenService.generate2faChallengeToken(user.id);
            return {
                requires2FA: true,
                challengeToken,
                userId: user.id,
                message: 'Please enter your 6-digit Authenticator code or recovery backup code.',
            };
        }
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress);
        const sanitizedUser = await this.usersService.findById(user.id);
        return {
            user: sanitizedUser,
            tokens,
        };
    }
    async verify2faLogin(target, code, deviceInfo, ipAddress) {
        let resolvedUserId;
        if (target.challengeToken) {
            resolvedUserId = await this.tokenService.verify2faChallengeToken(target.challengeToken);
        }
        else {
            throw new UnauthorizedException('A valid 2FA challenge token is required.');
        }
        await this.totpService.verify2FA(resolvedUserId, code);
        await this.tokenService.consume2faChallengeToken(target.challengeToken, resolvedUserId);
        const user = await this.usersService.findById(resolvedUserId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Your account is inactive or suspended');
        }
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress);
        return {
            user,
            tokens,
        };
    }
    async verifyPasskeyLogin(response, challengeKey, deviceInfo, ipAddress) {
        const result = await this.webAuthnService.verifyPasskeyLogin(response, challengeKey);
        const user = await this.usersService.findById(result.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Your account is inactive or suspended');
        }
        const tokens = await this.tokenService.generateTokenPair(user.id, user.email, user.globalRole, undefined, deviceInfo, ipAddress);
        return {
            user,
            tokens,
        };
    }
    async refreshTokens(refreshToken, deviceInfo, ipAddress) {
        return this.tokenService.rotateRefreshToken(refreshToken, deviceInfo, ipAddress);
    }
    async logout(refreshToken) {
        await this.tokenService.revokeToken(refreshToken);
        return { success: true };
    }
    async logoutAll(userId) {
        await this.tokenService.revokeAllUserSessions(userId);
        return { success: true };
    }
    async getProfile(userId) {
        return this.usersService.getProfile(userId);
    }
    async changePassword(userId, currentPass, newPass) {
        return this.usersService.changePassword(userId, currentPass, newPass);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        TokenService,
        TotpService,
        WebAuthnService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map