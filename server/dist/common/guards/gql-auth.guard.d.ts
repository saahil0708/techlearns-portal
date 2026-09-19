import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const GqlAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GqlAuthGuard extends GqlAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    getRequest(context: ExecutionContext): any;
    handleRequest(err: any, user: any, _info: any, context: ExecutionContext): any;
}
export {};
