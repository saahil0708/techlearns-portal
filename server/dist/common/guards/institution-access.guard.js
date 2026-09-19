var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
let InstitutionAccessGuard = class InstitutionAccessGuard {
    canActivate(context) {
        const isGql = typeof context.getType === 'function' && context.getType() === 'graphql';
        let request;
        if (isGql) {
            const ctx = GqlExecutionContext.create(context);
            request = ctx.getContext().req;
        }
        else {
            request = typeof context.switchToHttp === 'function' ? context.switchToHttp().getRequest() : context.req;
        }
        const user = request?.user;
        if (!user) {
            return false;
        }
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return true;
        }
        const institutionId = request.params?.institutionId ||
            request.params?.collegeId ||
            request.params?.id ||
            request.body?.institutionId ||
            request.body?.collegeId ||
            request.query?.institutionId ||
            request.query?.collegeId;
        if (!institutionId) {
            return true;
        }
        const membership = user.memberships?.find((m) => m.institutionId === institutionId || m.collegeId === institutionId);
        if (!membership) {
            throw new ForbiddenException('You do not have access to this institution organization');
        }
        return true;
    }
};
InstitutionAccessGuard = __decorate([
    Injectable()
], InstitutionAccessGuard);
export { InstitutionAccessGuard };
//# sourceMappingURL=institution-access.guard.js.map