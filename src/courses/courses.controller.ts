import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';

@ApiTags('courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ----------------------------------------------------
  // COURSES
  // ----------------------------------------------------

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Create a new course curriculum' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(user.id, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all available courses with optional filters' })
  @ApiQuery({ name: 'collegeId', required: false })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('collegeId') collegeId?: string,
    @Query('status') status?: CourseStatus,
  ) {
    return this.coursesService.findAll(collegeId, status, user);
  }

  @Get('enrolled')
  @ApiOperation({ summary: 'List all courses enrolled by the current user' })
  async getEnrolled(@CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.getEnrolledCourses(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course curriculum details, modules, and lessons' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.findCourseById(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Update course details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateCourse(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Delete a course' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.deleteCourse(id, user);
  }

  // ----------------------------------------------------
  // MODULES
  // ----------------------------------------------------

  @Post(':id/modules')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Add a new module to a course' })
  async createModule(
    @Param('id') courseId: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.createModule(courseId, dto, user);
  }

  @Patch('modules/:moduleId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Update module details' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateModule(moduleId, dto, user);
  }

  @Delete('modules/:moduleId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Delete a module from a course' })
  async deleteModule(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.deleteModule(moduleId, user);
  }

  // ----------------------------------------------------
  // LESSONS
  // ----------------------------------------------------

  @Post('modules/:moduleId/lessons')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Add a lesson to a module' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.createLesson(moduleId, dto, user);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Read lesson content and user completion state' })
  async getLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getLesson(lessonId, user);
  }

  @Patch('lessons/:lessonId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Update lesson content or title' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateLesson(lessonId, dto, user);
  }

  @Delete('lessons/:lessonId')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.deleteLesson(lessonId, user);
  }

  // ----------------------------------------------------
  // ENROLLMENTS & PROGRESS
  // ----------------------------------------------------

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Enroll current user into a course' })
  async enroll(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.enrollStudent(courseId, user);
  }

  @Post('lessons/:lessonId/progress')
  @ApiOperation({ summary: 'Mark lesson as completed or in-progress' })
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateLessonProgress(lessonId, user.id, dto.completed);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get current user overall completion progress in a course' })
  async getCourseProgress(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseProgress(courseId, user);
  }
}
