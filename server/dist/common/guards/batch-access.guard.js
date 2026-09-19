var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
let BatchAccessGuard = class BatchAccessGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return true;
        }
        const batchId = request.params?.id;
        if (!batchId) {
            return true;
        }
        const batch = await this.prisma.batch.findUnique({
            where: { id: batchId },
            select: { institutionId: true },
        });
        if (!batch) {
            throw new ForbiddenException('Batch not found');
        }
        const hasMembership = user.memberships?.some((m) => m.institutionId === batch.institutionId || m.collegeId === batch.institutionId);
        if (!hasMembership) {
            throw new ForbiddenException('You do not have access to this batch');
        }
        return true;
    }
};
BatchAccessGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], BatchAccessGuard);
export { BatchAccessGuard };
//# sourceMappingURL=batch-access.guard.js.map