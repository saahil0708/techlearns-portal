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
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { BulkInviteDto } from './dto/bulk-invite.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
import { validateUserCreationRBAC } from './utils/user-rbac.util.js';
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(dto, currentUser) {
        const targetInstitutionId = dto.institutionId || dto.collegeId;
        const targetRole = dto.globalRole || Role.STUDENT;
        validateUserCreationRBAC(currentUser, targetRole, targetInstitutionId);
        return this.usersService.createWithInput(dto);
    }
    async bulkInvite(dto, currentUser) {
        for (const item of dto.users) {
            const instId = item.institutionId || item.collegeId;
            const targetRole = item.role || Role.STUDENT;
            validateUserCreationRBAC(currentUser, targetRole, instId);
        }
        return this.usersService.bulkInvite(dto);
    }
    async getUsers(query, currentUser) {
        const isSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN;
        let targetInstId = query.institutionId || query.collegeId;
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
        const normalizedSortOrder = query.sortOrder
            ? (String(query.sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc')
            : undefined;
        const paginationArgs = {
            page: query.page,
            limit: query.limit,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: normalizedSortOrder,
        };
        return this.usersService.findPaginated(paginationArgs, query.role, query.status, targetInstId);
    }
    async getMe(currentUser) {
        return this.usersService.getProfile(currentUser.id);
    }
    async getUser(id, currentUser) {
        const isSelf = currentUser.id === id;
        const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN ||
            currentUser.globalRole === Role.INSTITUTION_ADMIN;
        if (!isSelf && !isAdmin) {
            throw new ForbiddenException('You do not have permission to view this user profile.');
        }
        if (currentUser.globalRole === Role.INSTITUTION_ADMIN && !isSelf) {
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
    async updateUser(id, dto, currentUser) {
        const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN ||
            currentUser.globalRole === Role.PLATFORM_ADMIN;
        if (currentUser.id !== id && !isAdmin) {
            throw new ForbiddenException('You are not authorized to update another user profile');
        }
        if (!isAdmin) {
            if (dto.globalRole !== undefined ||
                dto.status !== undefined ||
                dto.contestRating !== undefined ||
                dto.ratingTier !== undefined ||
                dto.password !== undefined ||
                dto.email !== undefined) {
                throw new ForbiddenException('You do not have permission to modify privileged user attributes');
            }
        }
        return this.usersService.updateUser(id, dto);
    }
    async deleteUser(id) {
        const success = await this.usersService.deleteUser(id);
        return { success, message: 'User deleted successfully' };
    }
};
__decorate([
    Post(),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({
        summary: 'Create a single user account with strict hierarchical RBAC enforcement',
        description: 'SUPER_ADMIN can create any role. PLATFORM_ADMIN can create Institution Admin, Faculty, and Students. INSTITUTION_ADMIN can create Faculty and Students within their tenant. FACULTY can only create Students within their tenant.',
    }),
    ApiResponse({ status: 201, description: 'User created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden: Insufficient hierarchical role privilege' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    Post('bulk-invite'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Bulk invite users with strict hierarchical RBAC validation per invitee',
    }),
    ApiResponse({ status: 200, description: 'Invitations processed and queued' }),
    ApiResponse({ status: 403, description: 'Forbidden: One or more target roles exceed privilege' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkInviteDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "bulkInvite", null);
__decorate([
    Get(),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    ApiOperation({ summary: 'List users with pagination, filtering, and tenant isolation' }),
    ApiResponse({ status: 200, description: 'Paginated user list returned' }),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListUsersQueryDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    Get('me'),
    ApiOperation({ summary: 'Get current user sanitized profile' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get user details by ID' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update user profile attributes with privilege checks' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    Delete(':id'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    ApiOperation({ summary: 'Delete user account (Platform/Super Admin only)' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
UsersController = __decorate([
    ApiTags('users'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map