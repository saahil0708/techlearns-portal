import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenService } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('jwt.secret') || 'default-jwt-secret',
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') || '15m') as any,
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
export class AuthModule {}

