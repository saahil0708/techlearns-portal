import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../types/current-user.interface.js';

@Injectable()
export class BatchAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user) {
      return false;
    }

    // Global Super Admin & Platform Admin have access across all colleges
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return true;
    }

    const batchId = request.params?.id;

    if (!batchId) {
      return true;
    }

    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      select: { collegeId: true },
    });

    if (!batch) {
      throw new ForbiddenException('Batch not found');
    }

    const hasMembership = user.memberships?.some(
      (m) => m.collegeId === batch.collegeId,
    );

    if (!hasMembership) {
      throw new ForbiddenException('You do not have access to this batch');
    }

    return true;
  }
}