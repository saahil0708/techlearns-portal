import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { CurrentUserPayload } from '../../common/types/current-user.interface.js';
import { UsersService } from '../../users/users.service.js';
export interface JwtPayload {
    sub: string;
    email: string;
    globalRole: string;
    iat?: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<CurrentUserPayload>;
}
export {};
