import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseStatus, Role } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CoursesService } from './courses.service.js';
import { BulkImportCurriculumDto } from './dto/bulk-import-curriculum.dto.js';
import { CreateCompositeCourseDto } from './dto/create-composite-course.dto.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { EnrollBatchDto } from './dto/enroll-batch.dto.js';
import { QueryCourseRosterDto } from './dto/query-course-roster.dto.js';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto.js';
import { ReorderModulesDto } from './dto/reorder-modules.dto.js';
import { SubmitQuizDto } from './dto/submit-quiz.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ----------------------------------------------------
  // COURSES
  // ----------------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new basic course metadata entry' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(user.id, dto, user);
  }

  @Post('composite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a full course curriculum with modules & lessons in a single transaction' })
  @ApiResponse({ status: 201, description: 'Full course curriculum created successfully' })
  async createComposite(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCompositeCourseDto,
  ) {
    return this.coursesService.createCompositeCourse(user.id, dto, user);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List all available courses with optional filters' })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'collegeId', required: false })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  async findAll(
    @CurrentUser() user?: CurrentUserPayload,
    @Query('institutionId') institutionId?: string,
    @Query('collegeId') collegeId?: string,
    @Query('status') status?: CourseStatus,
  ) {
    return this.coursesService.findAll(institutionId || collegeId, status, user);
  }

  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all courses enrolled by the current user' })
  async getEnrolled(@CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.getEnrolledCourses(user.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get course curriculum details, modules, and lessons' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.coursesService.findCourseById(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update course details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateCourse(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a course' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.deleteCourse(id, user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish course curriculum for student enrollment' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.publishCourse(id, user);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unpublish course back to draft' })
  async unpublish(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.unpublishCourse(id, user);
  }

  @Post(':id/curriculum/bulk-import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk import modules, submodules, notes, and questions into a course' })
  @ApiResponse({ status: 201, description: 'Curriculum bulk imported successfully' })
  async bulkImportCurriculum(
    @Param('id') id: string,
    @Body() dto: BulkImportCurriculumDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.bulkImportCurriculum(id, dto, user);
  }

  // ----------------------------------------------------
  // MODULES
  // ----------------------------------------------------

  @Post(':id/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a new module to a course' })
  async createModule(
    @Param('id') courseId: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.createModule(courseId, dto, user);
  }

  @Put(':id/modules/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Batch reorder modules within a course' })
  async reorderModules(
    @Param('id') courseId: string,
    @Body() dto: ReorderModulesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.reorderModules(courseId, dto, user);
  }

  @Patch('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update module details' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateModule(moduleId, dto, user);
  }

  @Delete('modules/:moduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a lesson to a module' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.createLesson(moduleId, dto, user);
  }

  @Put('modules/:moduleId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Batch reorder lessons within a module' })
  async reorderLessons(
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderLessonsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.reorderLessons(moduleId, dto, user);
  }

  @Get('lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Read lesson content and user completion state' })
  async getLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getLesson(lessonId, user);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lesson content, quiz, or title' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateLesson(lessonId, dto, user);
  }

  @Delete('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.deleteLesson(lessonId, user);
  }

  // ----------------------------------------------------
  // ENROLLMENTS & ROSTER
  // ----------------------------------------------------

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enroll current user into a course' })
  async enroll(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.enrollStudent(courseId, user);
  }

  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Drop / unenroll from a course' })
  async unenroll(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('userId') targetUserId?: string,
  ) {
    return this.coursesService.unenrollStudent(courseId, user, targetUserId);
  }

  @Post(':id/enroll-batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk enroll an entire student batch/cohort into a course' })
  async enrollBatch(
    @Param('id') courseId: string,
    @Body() dto: EnrollBatchDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.enrollBatchStudents(courseId, dto, user);
  }

  @Get(':id/roster')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated course roster and gradebook progress (Rule #10 table format)' })
  async getRoster(
    @Param('id') courseId: string,
    @Query() query: QueryCourseRosterDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseRoster(courseId, query, user);
  }

  @Get(':id/roster/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Export course gradebook roster as a CSV spreadsheet' })
  async exportRosterCsv(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.coursesService.exportCourseRosterCsv(courseId, user);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="course-${courseId}-roster.csv"`);
    return csv;
  }

  @Post('lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark lesson as completed or in-progress' })
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateLessonProgress(lessonId, user.id, dto.completed);
  }

  @Post('lessons/:lessonId/quiz-submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit quiz answer for a lesson' })
  async submitQuiz(
    @Param('lessonId') lessonId: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.submitQuiz(lessonId, user, dto.selectedOption);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user overall completion progress in a course' })
  async getCourseProgress(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseProgress(courseId, user);
  }
}
