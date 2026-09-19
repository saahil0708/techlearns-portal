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
import { Role, UserStatus } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { BulkInviteUsersInput } from './dto/bulk-invite.input.js';
import { CreateUserInput } from './dto/create-user.input.js';
import { UpdateUserInput } from './dto/update-user.input.js';
import { validateUserCreationRBAC } from './utils/user-rbac.util.js';
import { AdminMetricsType } from './types/admin-metrics.type.js';
import { AuditLogItemType } from './types/audit-log.type.js';
import { StudentProfileType } from './types/student-stats.type.js';
import { UserType } from './types/user.type.js';
import { UsersConnection } from './types/users-connection.type.js';
import { BulkInviteResultType } from './types/bulk-invite-result.type.js';
import { UsersService } from './users.service.js';
let UsersResolver = class UsersResolver {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUsers(paginationArgs, currentUser, role, status, institutionId, collegeId) {
        const isSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN;
        let targetInstId = institutionId || collegeId;
        if (!isSuperAdmin) {
            const adminInstitutionIds = currentUser.memberships
                ?.filter((m) => m.role === Role.INSTITUTION_ADMIN)
                .map((m) => m.institutionId) || [];
            if (adminInstitutionIds.length === 0) {
                throw new ForbiddenException('You do not have institution admin privileges');
            }
            if (targetInstId) {
                if (!adminInstitutionIds.includes(targetInstId)) {
                    throw new ForbiddenException('You can only list users within your own institution');
                }
            }
            else {
                targetInstId = adminInstitutionIds[0];
            }
        }
        return this.usersService.findPaginated(paginationArgs, role, status, targetInstId);
    }
    async getUser(id, currentUser) {
        const isSelf = currentUser.id === id;
        const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN ||
            currentUser.globalRole === Role.INSTITUTION_ADMIN;
        if (!isSelf && !isAdmin) {
            throw new ForbiddenException('You do not have permission to view this user profile.');
        }
        if (currentUser.globalRole === Role.INSTITUTION_ADMIN) {
            const target = await this.usersService.findById(id);
            const targetMemberships = target?.memberships;
            const allowed = targetMemberships?.some((membership) => currentUser.memberships?.some((ownMembership) => ownMembership.institutionId === membership.institutionId &&
                ownMembership.role === Role.INSTITUTION_ADMIN));
            if (!allowed) {
                throw new ForbiddenException('You do not have permission to view this user profile.');
            }
            return target;
        }
        return this.usersService.findById(id);
    }
    async getMe(currentUser) {
        return this.usersService.getProfile(currentUser.id);
    }
    async getStudentProfile(handleOrId, currentUser) {
        const profile = await this.usersService.getStudentProfile(handleOrId);
        const isOwnerOrAdmin = profile.id === currentUser.id ||
            currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN;
        if (!isOwnerOrAdmin) {
            profile.email = undefined;
            profile.phone = null;
            profile.location = null;
            profile.resumeFileName = null;
            profile.resumeUrl = null;
            if (profile.submissions) {
                profile.submissions = profile.submissions.map((s) => ({
                    ...s,
                    codeSnippet: undefined,
                }));
            }
        }
        return profile;
    }
    async getAdminMetrics(currentUser) {
        return this.usersService.getSuperAdminMetrics(currentUser);
    }
    async getAdminAuditLogs(currentUser) {
        return this.usersService.getAdminAuditLogs(currentUser.id);
    }
    async createUser(input, currentUser) {
        const targetInstitutionId = input.institutionId || input.collegeId;
        const targetRole = input.globalRole || Role.STUDENT;
        validateUserCreationRBAC(currentUser, targetRole, targetInstitutionId);
        return this.usersService.createWithInput(input);
    }
    async updateUser(id, input, currentUser) {
        const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN;
        if (currentUser.id !== id && !isAdmin) {
            throw new ForbiddenException('You are not authorized to update another user profile');
        }
        if (!isAdmin) {
            if (input.globalRole !== undefined ||
                input.status !== undefined ||
                input.contestRating !== undefined ||
                input.ratingTier !== undefined ||
                input.password !== undefined ||
                input.email !== undefined) {
                throw new ForbiddenException('You do not have permission to modify privileged user attributes');
            }
        }
        return this.usersService.updateUser(id, input);
    }
    async deleteUser(id) {
        return this.usersService.deleteUser(id);
    }
    async bulkInviteUsers(input, currentUser) {
        for (const item of input.users) {
            const instId = item.institutionId || item.collegeId;
            const targetRole = item.role || Role.STUDENT;
            validateUserCreationRBAC(currentUser, targetRole, instId);
        }
        return this.usersService.bulkInvite(input);
    }
};
__decorate([
    Query(() => UsersConnection, { name: 'users' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    __param(0, Args()),
    __param(1, GqlCurrentUser()),
    __param(2, Args('role', { type: () => Role, nullable: true })),
    __param(3, Args('status', { type: () => UserStatus, nullable: true })),
    __param(4, Args('institutionId', { type: () => String, nullable: true })),
    __param(5, Args('collegeId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getUsers", null);
__decorate([
    Query(() => UserType, { name: 'user', nullable: true }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getUser", null);
__decorate([
    Query(() => UserType, { name: 'me' }),
    UseGuards(GqlAuthGuard),
    __param(0, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getMe", null);
__decorate([
    Query(() => StudentProfileType, { name: 'studentProfile' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('handleOrId', { type: () => String })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getStudentProfile", null);
__decorate([
    Query(() => AdminMetricsType, { name: 'adminMetrics' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    __param(0, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getAdminMetrics", null);
__decorate([
    Query(() => [AuditLogItemType], { name: 'adminAuditLogs' }),
    UseGuards(GqlAuthGuard),
    __param(0, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "getAdminAuditLogs", null);
__decorate([
    Mutation(() => UserType, { name: 'createUser' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserInput, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "createUser", null);
__decorate([
    Mutation(() => UserType, { name: 'updateUser' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserInput, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "updateUser", null);
__decorate([
    Mutation(() => Boolean, { name: 'deleteUser' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "deleteUser", null);
__decorate([
    Mutation(() => BulkInviteResultType, { name: 'bulkInviteUsers' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkInviteUsersInput, Object]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "bulkInviteUsers", null);
UsersResolver = __decorate([
    Resolver(() => UserType),
    __metadata("design:paramtypes", [UsersService])
], UsersResolver);
export { UsersResolver };
//# sourceMappingURL=users.resolver.js.map