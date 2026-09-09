import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../types/current-user.interface.js';

@Injectable()
export class CollegeAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user) {
      return false;
    }

    // Global Super Admin & Platform Admin have access across all colleges
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return true;
    }

    const collegeId =
      request.params?.collegeId ||
      request.params?.id ||
      request.body?.collegeId ||
      request.query?.collegeId;

    if (!collegeId) {
      return true;
    }

    const hasMembership = user.memberships?.some(
      (m) => m.collegeId === collegeId,
    );

    if (!hasMembership) {
      throw new ForbiddenException('You do not have access to this college organization');
    }

    return true;
  }
}
