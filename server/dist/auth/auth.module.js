var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenService } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            UsersModule,
            PassportModule.register({ defaultStrategy: 'jwt' }),
            JwtModule.registerAsync({
                imports: [ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('jwt.secret') || 'default-jwt-secret',
                    signOptions: {
                        expiresIn: (configService.get('jwt.expiresIn') || '15m'),
                    },
                }),
                inject: [ConfigService],
            }),
        ],
        controllers: [AuthController],
        providers: [
            AuthService,
            TokenService,
            TotpService,
            WebAuthnService,
            JwtStrategy,
        ],
        exports: [
            AuthService,
            TokenService,
            TotpService,
            WebAuthnService,
            JwtStrategy,
            PassportModule,
            JwtModule,
        ],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map