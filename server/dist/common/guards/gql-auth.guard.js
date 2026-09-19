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
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator.js';
let GqlAuthGuard = class GqlAuthGuard extends AuthGuard('jwt') {
    reflector;
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    getRequest(context) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
    handleRequest(err, user, _info, context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return user || null;
        }
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    }
};
GqlAuthGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], GqlAuthGuard);
export { GqlAuthGuard };
//# sourceMappingURL=gql-auth.guard.js.map