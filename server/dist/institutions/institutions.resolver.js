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
import { InstitutionStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { AddInstitutionMemberInput } from './dto/add-member.input.js';
import { CreateInstitutionInput } from './dto/create-institution.input.js';
import { UpdateInstitutionInput } from './dto/update-institution.input.js';
import { InstitutionsService } from './institutions.service.js';
import { InstitutionType } from './types/institution.type.js';
import { InstitutionsConnection } from './types/institutions-connection.type.js';
let InstitutionsResolver = class InstitutionsResolver {
    institutionsService;
    constructor(institutionsService) {
        this.institutionsService = institutionsService;
    }
    checkInstitutionAdminAccess(user, targetInstitutionId, targetRole) {
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const membership = user.memberships?.find((m) => m.institutionId === targetInstitutionId);
        if (!membership || (membership.role !== Role.INSTITUTION_ADMIN && membership.role !== Role.FACULTY)) {
            throw new ForbiddenException('You do not have administrative or faculty access to this institution');
        }
        if (membership.role === Role.FACULTY && targetRole && targetRole !== Role.STUDENT) {
            throw new ForbiddenException('Faculty can only manage student memberships');
        }
    }
    checkInstitutionUpdateAccess(user, targetInstitutionId) {
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const hasAdmin = user.memberships?.some((m) => m.institutionId === targetInstitutionId && m.role === Role.INSTITUTION_ADMIN);
        if (!hasAdmin) {
            throw new ForbiddenException('You do not have administrative access to update this institution');
        }
    }
    checkInstitutionMemberAccess(user, targetInstitutionId) {
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const hasMember = user.memberships?.some((m) => m.institutionId === targetInstitutionId);
        if (!hasMember) {
            throw new ForbiddenException('You do not have access to this institution organization');
        }
    }
    async getInstitutions(paginationArgs, status) {
        return this.institutionsService.findPaginated(paginationArgs, status);
    }
    async getInstitution(id, currentUser) {
        this.checkInstitutionMemberAccess(currentUser, id);
        return this.institutionsService.findOne(id);
    }
    async createInstitution(input) {
        return this.institutionsService.create(input);
    }
    async updateInstitution(id, input, currentUser) {
        this.checkInstitutionUpdateAccess(currentUser, id);
        return this.institutionsService.update(id, input);
    }
    async deleteInstitution(id) {
        return this.institutionsService.delete(id);
    }
    async addInstitutionMember(institutionId, input, currentUser) {
        this.checkInstitutionAdminAccess(currentUser, institutionId, input.role);
        let allowedTargetRole;
        if (currentUser.globalRole !== Role.SUPER_ADMIN &&
            currentUser.globalRole !== Role.PLATFORM_ADMIN) {
            const membership = currentUser.memberships?.find((m) => m.institutionId === institutionId);
            if (membership?.role === Role.FACULTY) {
                allowedTargetRole = Role.STUDENT;
            }
        }
        await this.institutionsService.addMember(institutionId, input, allowedTargetRole);
        return true;
    }
    async removeInstitutionMember(institutionId, userId, currentUser) {
        this.checkInstitutionAdminAccess(currentUser, institutionId);
        let allowedRole;
        if (currentUser.globalRole !== Role.SUPER_ADMIN &&
            currentUser.globalRole !== Role.PLATFORM_ADMIN) {
            const membership = currentUser.memberships?.find((m) => m.institutionId === institutionId);
            if (membership?.role === Role.FACULTY) {
                allowedRole = Role.STUDENT;
            }
        }
        await this.institutionsService.removeMember(institutionId, userId, allowedRole);
        return true;
    }
};
__decorate([
    Query(() => InstitutionsConnection, { name: 'institutions' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    __param(0, Args()),
    __param(1, Args('status', { type: () => InstitutionStatus, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, String]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "getInstitutions", null);
__decorate([
    Query(() => InstitutionType, { name: 'institution', nullable: true }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "getInstitution", null);
__decorate([
    Mutation(() => InstitutionType, { name: 'createInstitution' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    __param(0, Args('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInstitutionInput]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "createInstitution", null);
__decorate([
    Mutation(() => InstitutionType, { name: 'updateInstitution' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateInstitutionInput, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "updateInstitution", null);
__decorate([
    Mutation(() => Boolean, { name: 'deleteInstitution' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "deleteInstitution", null);
__decorate([
    Mutation(() => Boolean, { name: 'addInstitutionMember' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, Args('institutionId', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddInstitutionMemberInput, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "addInstitutionMember", null);
__decorate([
    Mutation(() => Boolean, { name: 'removeInstitutionMember' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, Args('institutionId', { type: () => ID })),
    __param(1, Args('userId', { type: () => ID })),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsResolver.prototype, "removeInstitutionMember", null);
InstitutionsResolver = __decorate([
    Resolver(() => InstitutionType),
    __metadata("design:paramtypes", [InstitutionsService])
], InstitutionsResolver);
export { InstitutionsResolver };
//# sourceMappingURL=institutions.resolver.js.map