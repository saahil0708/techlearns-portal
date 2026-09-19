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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
let CoursesController = class CoursesController {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async create(user, dto) {
        return this.coursesService.createCourse(user.id, dto, user);
    }
    async findAll(user, institutionId, collegeId, status) {
        return this.coursesService.findAll(institutionId || collegeId, status, user);
    }
    async getEnrolled(user) {
        return this.coursesService.getEnrolledCourses(user.id);
    }
    async findOne(id, user) {
        return this.coursesService.findCourseById(id, user);
    }
    async update(id, dto, user) {
        return this.coursesService.updateCourse(id, dto, user);
    }
    async delete(id, user) {
        return this.coursesService.deleteCourse(id, user);
    }
    async createModule(courseId, dto, user) {
        return this.coursesService.createModule(courseId, dto, user);
    }
    async updateModule(moduleId, dto, user) {
        return this.coursesService.updateModule(moduleId, dto, user);
    }
    async deleteModule(moduleId, user) {
        return this.coursesService.deleteModule(moduleId, user);
    }
    async createLesson(moduleId, dto, user) {
        return this.coursesService.createLesson(moduleId, dto, user);
    }
    async getLesson(lessonId, user) {
        return this.coursesService.getLesson(lessonId, user);
    }
    async updateLesson(lessonId, dto, user) {
        return this.coursesService.updateLesson(lessonId, dto, user);
    }
    async deleteLesson(lessonId, user) {
        return this.coursesService.deleteLesson(lessonId, user);
    }
    async enroll(courseId, user) {
        return this.coursesService.enrollStudent(courseId, user);
    }
    async updateProgress(lessonId, dto, user) {
        return this.coursesService.updateLessonProgress(lessonId, user.id, dto.completed);
    }
    async getCourseProgress(courseId, user) {
        return this.coursesService.getCourseProgress(courseId, user);
    }
};
__decorate([
    Post(),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Create a new course curriculum' }),
    ApiResponse({ status: 201, description: 'Course created successfully' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCourseDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'List all available courses with optional filters' }),
    ApiQuery({ name: 'institutionId', required: false }),
    ApiQuery({ name: 'collegeId', required: false }),
    ApiQuery({ name: 'status', enum: CourseStatus, required: false }),
    __param(0, CurrentUser()),
    __param(1, Query('institutionId')),
    __param(2, Query('collegeId')),
    __param(3, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findAll", null);
__decorate([
    Get('enrolled'),
    ApiOperation({ summary: 'List all courses enrolled by the current user' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getEnrolled", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get course curriculum details, modules, and lessons' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Update course details' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Delete a course' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "delete", null);
__decorate([
    Post(':id/modules'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Add a new module to a course' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateModuleDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createModule", null);
__decorate([
    Patch('modules/:moduleId'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Update module details' }),
    __param(0, Param('moduleId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateModuleDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateModule", null);
__decorate([
    Delete('modules/:moduleId'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Delete a module from a course' }),
    __param(0, Param('moduleId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteModule", null);
__decorate([
    Post('modules/:moduleId/lessons'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Add a lesson to a module' }),
    __param(0, Param('moduleId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createLesson", null);
__decorate([
    Get('lessons/:lessonId'),
    ApiOperation({ summary: 'Read lesson content and user completion state' }),
    __param(0, Param('lessonId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getLesson", null);
__decorate([
    Patch('lessons/:lessonId'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Update lesson content or title' }),
    __param(0, Param('lessonId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateLesson", null);
__decorate([
    Delete('lessons/:lessonId'),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY),
    ApiOperation({ summary: 'Delete a lesson' }),
    __param(0, Param('lessonId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteLesson", null);
__decorate([
    Post(':id/enroll'),
    ApiOperation({ summary: 'Enroll current user into a course' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "enroll", null);
__decorate([
    Post('lessons/:lessonId/progress'),
    ApiOperation({ summary: 'Mark lesson as completed or in-progress' }),
    __param(0, Param('lessonId')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProgressDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateProgress", null);
__decorate([
    Get(':id/progress'),
    ApiOperation({ summary: 'Get current user overall completion progress in a course' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseProgress", null);
CoursesController = __decorate([
    ApiTags('courses'),
    ApiBearerAuth('JWT-auth'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('courses'),
    __metadata("design:paramtypes", [CoursesService])
], CoursesController);
export { CoursesController };
//# sourceMappingURL=courses.controller.js.map