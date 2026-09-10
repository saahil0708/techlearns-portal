import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { CurrentUserPayload } from '../types/current-user.interface.js';

const GLOBAL_ONLY_ROLES: Role[] = [Role.SUPER_ADMIN, Role.PLATFORM_ADMIN];

@Injectable()
export class GqlRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request?.user as CurrentUserPayload | undefined;

    if (!user) {
      return false;
    }

    // SUPER_ADMIN has platform-wide super access
    if (user.globalRole === Role.SUPER_ADMIN) {
      return true;
    }

    // Check user's global role
    if (requiredRoles.includes(user.globalRole)) {
      return true;
    }

    // Check user's college membership roles
    // BUT: membership roles can NEVER satisfy SUPER_ADMIN or PLATFORM_ADMIN requirements
    if (user.memberships) {
      const hasRequiredMembershipRole = user.memberships.some((m) =>
        requiredRoles.includes(m.role) && !GLOBAL_ONLY_ROLES.includes(m.role),
      );
      if (hasRequiredMembershipRole) {
        return true;
      }
    }

    return false;
  }
}
