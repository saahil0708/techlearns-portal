import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { CurrentUserPayload } from '../types/current-user.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user) {
      return false;
    }

    // SUPER_ADMIN has platform-wide super access to all endpoints
    if (user.globalRole === Role.SUPER_ADMIN) {
      return true;
    }

    // Check user's global role
    if (requiredRoles.includes(user.globalRole)) {
      return true;
    }

    // Check user's college membership roles
    if (user.memberships && user.memberships.some((m) => requiredRoles.includes(m.role))) {
      return true;
    }

    return false;
  }
}
