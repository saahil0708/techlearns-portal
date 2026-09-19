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
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CourseStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseInput } from './dto/create-course.input.js';
import { UpdateCourseInput } from './dto/update-course.input.js';
import { CourseType } from './types/course.type.js';
import { CoursesConnection } from './types/courses-connection.type.js';
let CoursesResolver = class CoursesResolver {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async getCourses(paginationArgs, institutionId, collegeId, status, currentUser) {
        return this.coursesService.findPaginated(paginationArgs, institutionId || collegeId, status, currentUser);
    }
    async getCourse(id, currentUser) {
        return this.coursesService.findCourseById(id, currentUser);
    }
    async createCourse(input, currentUser) {
        return this.coursesService.createCourse(currentUser.id, input, currentUser);
    }
    async updateCourse(id, input, currentUser) {
        return this.coursesService.updateCourse(id, input, currentUser);
    }
    async deleteCourse(id, currentUser) {
        await this.coursesService.deleteCourse(id, currentUser);
        return true;
    }
};
__decorate([
    Query(() => CoursesConnection, { name: 'courses' }),
    __param(0, Args()),
    __param(1, Args('institutionId', { type: () => String, nullable: true })),
    __param(2, Args('collegeId', { type: () => String, nullable: true })),
    __param(3, Args('status', { type: () => CourseStatus, nullable: true })),
    __param(4, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getCourses", null);
__decorate([
    Query(() => CourseType, { name: 'course', nullable: true }),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "getCourse", null);
__decorate([
    Mutation(() => CourseType, { name: 'createCourse' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCourseInput, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createCourse", null);
__decorate([
    Mutation(() => CourseType, { name: 'updateCourse' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCourseInput, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateCourse", null);
__decorate([
    Mutation(() => Boolean, { name: 'deleteCourse' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteCourse", null);
CoursesResolver = __decorate([
    Resolver(() => CourseType),
    __metadata("design:paramtypes", [CoursesService])
], CoursesResolver);
export { CoursesResolver };
//# sourceMappingURL=courses.resolver.js.map