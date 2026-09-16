import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../types/current-user.interface.js';

@Injectable()
export class InstitutionAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isGql = typeof context.getType === 'function' && (context.getType() as string) === 'graphql';
    let request: any;
    if (isGql) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = typeof context.switchToHttp === 'function' ? context.switchToHttp().getRequest() : (context as any).req;
    }

    const user = request?.user as CurrentUserPayload | undefined;

    if (!user) {
      return false;
    }

    // Global Super Admin & Platform Admin have access across all institutions
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return true;
    }

    // Check institutionId or collegeId from params, body, query
    const institutionId =
      request.params?.institutionId ||
      request.params?.collegeId ||
      request.params?.id ||
      request.body?.institutionId ||
      request.body?.collegeId ||
      request.query?.institutionId ||
      request.query?.collegeId;

    if (!institutionId) {
      return true;
    }

    const membership = user.memberships?.find(
      (m) => m.institutionId === institutionId || (m as any).collegeId === institutionId,
    );

    if (!membership) {
      throw new ForbiddenException('You do not have access to this institution organization');
    }

    return true;
  }
}
