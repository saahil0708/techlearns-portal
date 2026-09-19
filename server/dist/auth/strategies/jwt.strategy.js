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
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
let JwtStrategy = class JwtStrategy extends PassportStrategy(Strategy) {
    usersService;
    constructor(configService, usersService) {
        const secret = configService.get('jwt.secret') || 'default-jwt-secret';
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req) => {
                    if (!req || !req.cookies)
                        return null;
                    return req.cookies['access_token'] || req.cookies['accessToken'] || null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.usersService = usersService;
    }
    async validate(payload) {
        const user = await this.usersService.getProfile(payload.sub).catch(() => null);
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User account is invalid or inactive');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            globalRole: user.globalRole,
            memberships: user.memberships.map((m) => ({
                institutionId: m.institutionId || m.collegeId,
                role: m.role,
            })),
        };
    }
};
JwtStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        UsersService])
], JwtStrategy);
export { JwtStrategy };
//# sourceMappingURL=jwt.strategy.js.map