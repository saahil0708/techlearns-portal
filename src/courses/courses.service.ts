import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role } from '@prisma/client';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------
  // COURSE MANAGEMENT
  // ----------------------------------------------------

  async createCourse(userId: string, dto: CreateCourseDto) {
    if (dto.collegeId) {
      const college = await this.prisma.college.findUnique({
        where: { id: dto.collegeId },
      });
      if (!college) {
        throw new NotFoundException(`College with ID ${dto.collegeId} not found`);
      }
    }

    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        collegeId: dto.collegeId || null,
        createdById: userId,
        status: dto.status || CourseStatus.DRAFT,
      },
      include: {
        createdBy: {
          select: userSanitizedSelect,
        },
      },
    });
  }

  async findAll(collegeId?: string, status?: CourseStatus) {
    return this.prisma.course.findMany({
      where: {
        ...(collegeId ? { collegeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(
    args: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string },
    collegeId?: string,
    status?: CourseStatus,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (collegeId) {
      where.collegeId = collegeId;
    }

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    if (args.sortBy) {
      orderBy[args.sortBy] = args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          modules: {
            include: {
              lessons: true,
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: userSanitizedSelect,
        },
        college: {
          select: { id: true, name: true, code: true },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                order: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(id);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCourse(id: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(id);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------
  // MODULE MANAGEMENT
  // ----------------------------------------------------

  async createModule(courseId: string, dto: CreateModuleDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.module.create({
      data: {
        courseId,
        title: dto.title,
        description: dto.description,
        order: dto.order ?? 0,
      },
    });
  }

  async updateModule(moduleId: string, dto: UpdateModuleDto, user: CurrentUserPayload) {
    const moduleItem = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!moduleItem) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    this.assertCourseAuthorOrAdmin(moduleItem.course, user);

    return this.prisma.module.update({
      where: { id: moduleId },
      data: dto,
    });
  }

  async deleteModule(moduleId: string, user: CurrentUserPayload) {
    const moduleItem = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!moduleItem) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    this.assertCourseAuthorOrAdmin(moduleItem.course, user);

    return this.prisma.module.delete({
      where: { id: moduleId },
    });
  }

  // ----------------------------------------------------
  // LESSON MANAGEMENT
  // ----------------------------------------------------

  async createLesson(moduleId: string, dto: CreateLessonDto, user: CurrentUserPayload) {
    const moduleItem = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!moduleItem) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    this.assertCourseAuthorOrAdmin(moduleItem.course, user);

    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        content: dto.content,
        order: dto.order ?? 0,
      },
    });
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto, user: CurrentUserPayload) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    this.assertCourseAuthorOrAdmin(lesson.module.course, user);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });
  }

  async deleteLesson(lessonId: string, user: CurrentUserPayload) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    this.assertCourseAuthorOrAdmin(lesson.module.course, user);

    return this.prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  async getLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const progress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    return {
      ...lesson,
      completed: progress?.completed ?? false,
    };
  }

  // ----------------------------------------------------
  // ENROLLMENTS & PROGRESS
  // ----------------------------------------------------

  async enrollStudent(courseId: string, userId: string) {
    await this.findCourseById(courseId);

    return this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
      },
      create: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        course: {
          select: { id: true, title: true, description: true },
        },
      },
    });
  }

  async getEnrolledCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateLessonProgress(lessonId: string, userId: string, completed: boolean) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  async getCourseProgress(courseId: string, userId: string) {
    const course = await this.findCourseById(courseId);

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return { totalLessons: 0, completedLessons: 0, progressPercent: 0 };
    }

    const completedCount = await this.prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });

    return {
      totalLessons,
      completedLessons: completedCount,
      progressPercent: Math.round((completedCount / totalLessons) * 100),
    };
  }

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------

  private assertCourseAuthorOrAdmin(course: any, user: CurrentUserPayload) {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }

    if (course.createdById === user.id) {
      return;
    }

    const isCollegeAdmin = user.memberships?.some(
      (m) => m.collegeId === course.collegeId && m.role === Role.COLLEGE_ADMIN,
    );

    if (isCollegeAdmin) {
      return;
    }

    throw new ForbiddenException('You do not have permission to modify this course');
  }
}
