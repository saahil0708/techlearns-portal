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
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { InstitutionAccessGuard } from '../common/guards/institution-access.guard.js';
import { BatchAccessGuard } from '../common/guards/batch-access.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { BatchesService } from './batches.service.js';
import { AssignStudentsDto } from './dto/assign-students.dto.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';
let BatchesController = class BatchesController {
    batchesService;
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    async create(dto) {
        return this.batchesService.create(dto);
    }
    async findByInstitution(institutionId) {
        return this.batchesService.findByInstitution(institutionId);
    }
    async findByCollege(collegeId) {
        return this.batchesService.findByInstitution(collegeId);
    }
    async findOne(id) {
        return this.batchesService.findOne(id);
    }
    async update(id, dto) {
        return this.batchesService.update(id, dto);
    }
    async delete(id) {
        return this.batchesService.delete(id);
    }
    async assignStudents(id, dto) {
        const assignments = dto.students && dto.students.length > 0
            ? dto.students
            : dto.userIds || [];
        return this.batchesService.assignStudents(id, assignments);
    }
    async getStudents(id) {
        return this.batchesService.getStudents(id);
    }
    async removeStudent(id, userId) {
        return this.batchesService.removeStudent(id, userId);
    }
};
__decorate([
    Post(),
    UseGuards(InstitutionAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Create a new student batch/cohort' }),
    ApiResponse({ status: 201, description: 'Batch created successfully' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBatchDto]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "create", null);
__decorate([
    Get('institution/:institutionId'),
    UseGuards(InstitutionAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'List all batches in a specific institution' }),
    ApiResponse({ status: 200, description: 'List of batches' }),
    __param(0, Param('institutionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findByInstitution", null);
__decorate([
    Get('college/:collegeId'),
    UseGuards(InstitutionAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'List all batches in a specific institution (legacy route)' }),
    ApiResponse({ status: 200, description: 'List of batches' }),
    __param(0, Param('collegeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findByCollege", null);
__decorate([
    Get(':id'),
    UseGuards(BatchAccessGuard),
    ApiOperation({ summary: 'Get batch details by ID' }),
    ApiResponse({ status: 200, description: 'Batch details' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    UseGuards(BatchAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Update batch details' }),
    ApiResponse({ status: 200, description: 'Batch updated successfully' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBatchDto]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    UseGuards(BatchAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Delete a batch' }),
    ApiResponse({ status: 200, description: 'Batch deleted successfully' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "delete", null);
__decorate([
    Post(':id/students'),
    UseGuards(BatchAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Assign students to a batch' }),
    ApiResponse({ status: 201, description: 'Students assigned successfully' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignStudentsDto]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "assignStudents", null);
__decorate([
    Get(':id/students'),
    UseGuards(BatchAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'List all students assigned to a batch' }),
    ApiResponse({ status: 200, description: 'List of enrolled students' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "getStudents", null);
__decorate([
    Delete(':id/students/:userId'),
    UseGuards(BatchAccessGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Remove a student from a batch' }),
    ApiResponse({ status: 200, description: 'Student removed from batch successfully' }),
    __param(0, Param('id')),
    __param(1, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "removeStudent", null);
BatchesController = __decorate([
    ApiTags('batches'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('batches'),
    __metadata("design:paramtypes", [BatchesService])
], BatchesController);
export { BatchesController };
//# sourceMappingURL=batches.controller.js.map