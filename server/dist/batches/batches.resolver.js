var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { BatchesService } from './batches.service.js';
import { AssignStudentsInput } from './dto/assign-students.input.js';
import { CreateBatchInput } from './dto/create-batch.input.js';
import { UpdateBatchInput } from './dto/update-batch.input.js';
import { BatchStudentType } from './types/batch-student.type.js';
import { BatchStudentsConnection } from './types/batch-students-connection.type.js';
import { BatchType } from './types/batch.type.js';
import { BatchesConnection } from './types/batches-connection.type.js';
let BatchesResolver = class BatchesResolver {
    batchesService;
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    checkInstitutionBatchAccess(user, targetInstitutionId) {
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const hasAccess = user.memberships?.some((m) => m.institutionId === targetInstitutionId &&
            (m.role === Role.INSTITUTION_ADMIN || m.role === Role.FACULTY));
        if (!hasAccess) {
            throw new ForbiddenException('You do not have administrative or faculty access to this institution');
        }
    }
    async checkBatchAccess(user, batchId) {
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const batch = await this.batchesService.findOne(batchId);
        const hasAccess = user.memberships?.some((m) => m.institutionId === batch.institutionId &&
            (m.role === Role.INSTITUTION_ADMIN || m.role === Role.FACULTY));
        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to manage this batch');
        }
    }
    async getBatches(user, pagination, institutionId, collegeId) {
        let targetInstId = institutionId || collegeId;
        if (targetInstId) {
            this.checkInstitutionBatchAccess(user, targetInstId);
        }
        else if (user.globalRole !== Role.SUPER_ADMIN &&
            user.globalRole !== Role.PLATFORM_ADMIN) {
            const primaryMembership = user.memberships?.find((m) => m.role === Role.INSTITUTION_ADMIN || m.role === Role.FACULTY);
            if (!primaryMembership) {
                throw new ForbiddenException('No institution membership found with batch management rights');
            }
            targetInstId = primaryMembership.institutionId;
        }
        return this.batchesService.findPaginated(pagination, targetInstId);
    }
    async getBatch(user, id) {
        const batch = await this.batchesService.findOne(id);
        if (user.globalRole !== Role.SUPER_ADMIN &&
            user.globalRole !== Role.PLATFORM_ADMIN) {
            const hasMembership = user.memberships?.some((m) => m.institutionId === batch.institutionId);
            if (!hasMembership) {
                throw new ForbiddenException('You do not have access to this batch');
            }
        }
        return batch;
    }
    async getBatchStudents(user, batchId, pagination) {
        await this.checkBatchAccess(user, batchId);
        return this.batchesService.getStudentsPaginated(batchId, pagination);
    }
    async createBatch(user, input) {
        const targetInstId = input.institutionId || input.collegeId;
        if (!targetInstId) {
            throw new ForbiddenException('Institution ID is required');
        }
        this.checkInstitutionBatchAccess(user, targetInstId);
        return this.batchesService.create(input);
    }
    async updateBatch(user, id, input) {
        await this.checkBatchAccess(user, id);
        return this.batchesService.update(id, input);
    }
    async deleteBatch(user, id) {
        await this.checkBatchAccess(user, id);
        return this.batchesService.delete(id);
    }
    async assignStudentsToBatch(user, input) {
        await this.checkBatchAccess(user, input.batchId);
        const assignments = input.students && input.students.length > 0
            ? input.students
            : input.userIds?.map((userId) => ({ userId })) || [];
        return this.batchesService.assignStudents(input.batchId, assignments);
    }
    async removeStudentFromBatch(user, batchId, userId) {
        await this.checkBatchAccess(user, batchId);
        return this.batchesService.removeStudent(batchId, userId);
    }
};
__decorate([
    Query(() => BatchesConnection, { name: 'batches' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args({ type: () => PaginationArgs })),
    __param(2, Args('institutionId', { type: () => String, nullable: true })),
    __param(3, Args('collegeId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PaginationArgs, String, String]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "getBatches", null);
__decorate([
    Query(() => BatchType, { name: 'batch' }),
    UseGuards(GqlAuthGuard),
    __param(0, GqlCurrentUser()),
    __param(1, Args('id', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "getBatch", null);
__decorate([
    Query(() => BatchStudentsConnection, { name: 'batchStudents' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args('batchId', { type: () => ID })),
    __param(2, Args({ type: () => PaginationArgs })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, PaginationArgs]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "getBatchStudents", null);
__decorate([
    Mutation(() => BatchType),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateBatchInput]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "createBatch", null);
__decorate([
    Mutation(() => BatchType),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args('id', { type: () => ID })),
    __param(2, Args('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateBatchInput]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "updateBatch", null);
__decorate([
    Mutation(() => BatchType),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    __param(0, GqlCurrentUser()),
    __param(1, Args('id', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "deleteBatch", null);
__decorate([
    Mutation(() => [BatchStudentType]),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AssignStudentsInput]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "assignStudentsToBatch", null);
__decorate([
    Mutation(() => BatchStudentType),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, GqlCurrentUser()),
    __param(1, Args('batchId', { type: () => ID })),
    __param(2, Args('userId', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BatchesResolver.prototype, "removeStudentFromBatch", null);
BatchesResolver = __decorate([
    Resolver(() => BatchType),
    __metadata("design:paramtypes", [BatchesService])
], BatchesResolver);
export { BatchesResolver };
//# sourceMappingURL=batches.resolver.js.map