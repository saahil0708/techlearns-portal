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
import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { InstitutionAccessGuard } from '../common/guards/institution-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateInstitutionDto } from './dto/create-institution.dto.js';
import { UpdateInstitutionDto } from './dto/update-institution.dto.js';
import { InstitutionsService } from './institutions.service.js';
let InstitutionsController = class InstitutionsController {
    institutionsService;
    constructor(institutionsService) {
        this.institutionsService = institutionsService;
    }
    assertInstitutionAdminAccess(user, targetInstitutionId, targetRole) {
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
    async create(dto) {
        return this.institutionsService.create(dto);
    }
    async findAll() {
        return this.institutionsService.findAll();
    }
    async findOne(id) {
        return this.institutionsService.findOne(id);
    }
    async update(id, dto) {
        return this.institutionsService.update(id, dto);
    }
    async delete(id, purgeUsers) {
        return this.institutionsService.delete(id, purgeUsers === 'true');
    }
    async addMember(id, dto, user) {
        this.assertInstitutionAdminAccess(user, id, dto.role);
        let allowedTargetRole;
        if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
            const membership = user.memberships?.find((m) => m.institutionId === id);
            if (membership?.role === Role.FACULTY) {
                allowedTargetRole = Role.STUDENT;
            }
        }
        return this.institutionsService.addMember(id, dto, allowedTargetRole);
    }
    async getMembers(id) {
        return this.institutionsService.getMembers(id);
    }
    async removeMember(id, userId, user) {
        this.assertInstitutionAdminAccess(user, id);
        let allowedRole;
        if (user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
            const membership = user.memberships?.find((m) => m.institutionId === id);
            if (membership?.role === Role.FACULTY) {
                allowedRole = Role.STUDENT;
            }
        }
        return this.institutionsService.removeMember(id, userId, allowedRole);
    }
};
__decorate([
    Post(),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    ApiOperation({ summary: 'Create a new institution organization' }),
    ApiResponse({ status: 201, description: 'Institution created successfully' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInstitutionDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "create", null);
__decorate([
    Get(),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    ApiOperation({ summary: 'List all institution organizations' }),
    ApiResponse({ status: 200, description: 'List of institutions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get institution details by ID' }),
    ApiResponse({ status: 200, description: 'Institution details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN),
    ApiOperation({ summary: 'Update institution details' }),
    ApiResponse({ status: 200, description: 'Institution updated successfully' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateInstitutionDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN),
    ApiOperation({ summary: 'Delete an institution organization' }),
    ApiResponse({ status: 200, description: 'Institution deleted successfully' }),
    __param(0, Param('id')),
    __param(1, Query('purgeUsers')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "delete", null);
__decorate([
    Post(':id/members'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Add or update a member in the institution' }),
    ApiResponse({ status: 201, description: 'Member assigned successfully' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddMemberDto, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "addMember", null);
__decorate([
    Get(':id/members'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'List all members in the institution' }),
    ApiResponse({ status: 200, description: 'List of institution members' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "getMembers", null);
__decorate([
    Delete(':id/members/:userId'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Remove a member from the institution' }),
    ApiResponse({ status: 200, description: 'Member removed successfully' }),
    __param(0, Param('id')),
    __param(1, Param('userId')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "removeMember", null);
InstitutionsController = __decorate([
    ApiTags('institutions'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard, RolesGuard, InstitutionAccessGuard),
    Controller(['institutions', 'colleges']),
    __metadata("design:paramtypes", [InstitutionsService])
], InstitutionsController);
export { InstitutionsController };
//# sourceMappingURL=institutions.controller.js.map