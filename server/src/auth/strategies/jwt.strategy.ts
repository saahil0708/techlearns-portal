import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUserPayload } from '../../common/types/current-user.interface.js';
import { UsersService } from '../../users/users.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  globalRole: string;
  iat?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.secret') || 'default-jwt-secret';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          if (!req || !req.cookies) return null;
          return req.cookies['access_token'] || req.cookies['accessToken'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserPayload> {
    const user = await this.usersService.getProfile(payload.sub).catch(() => null);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is invalid or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
      memberships: user.memberships.map((m: any) => ({
        institutionId: m.institutionId || m.collegeId,
        role: m.role,
      })),
    };
  }
}

