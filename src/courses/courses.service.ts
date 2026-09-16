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

  async createCourse(userId: string, dto: CreateCourseDto, user?: CurrentUserPayload) {
    const institutionId = dto.institutionId || dto.collegeId;
    this.assertInstitutionAssignment(institutionId, user);
    if (institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: institutionId },
      });
      if (!institution) {
        throw new NotFoundException(`Institution with ID ${institutionId} not found`);
      }
    }

    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        institutionId: institutionId || null,
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

  async findAll(institutionId?: string, status?: CourseStatus, user?: CurrentUserPayload) {
    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    const targetInstId = institutionId;

    const where: any = {};
    if (isSuperAdmin) {
      if (targetInstId) where.institutionId = targetInstId;
      if (status) where.status = status;
    } else {
      where.status = CourseStatus.PUBLISHED;
      const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
      if (targetInstId) {
        if (!userInstitutionIds.includes(targetInstId)) {
          where.institutionId = '__unauthorized__';
        } else {
          where.institutionId = targetInstId;
        }
      } else {
        where.OR = [
          { institutionId: null },
          ...(userInstitutionIds.length > 0 ? [{ institutionId: { in: userInstitutionIds } }] : []),
        ];
      }
    }

    return this.prisma.course.findMany({
      where,
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
    institutionId?: string,
    status?: CourseStatus,
    user?: CurrentUserPayload,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const targetInstId = institutionId;

    const where: any = {};

    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (isSuperAdmin) {
      if (targetInstId) where.institutionId = targetInstId;
      if (status) where.status = status;
    } else {
      where.status = CourseStatus.PUBLISHED;
      const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
      if (targetInstId) {
        if (!userInstitutionIds.includes(targetInstId)) {
          where.institutionId = '__unauthorized__';
        } else {
          where.institutionId = targetInstId;
        }
      } else {
        const visibilityConditions = [
          { institutionId: null },
          ...(userInstitutionIds.length > 0 ? [{ institutionId: { in: userInstitutionIds } }] : []),
        ];
        if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: visibilityConditions }];
          delete where.OR;
        } else {
          where.OR = visibilityConditions;
        }
      }
    }

    const orderBy: any = {};
    if (args.sortBy && ['title', 'status', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
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

  async findCourseById(id: string, user?: CurrentUserPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: userSanitizedSelect,
        },
        institution: {
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

    const isPrivileged =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN ||
      course.createdById === user?.id ||
      Boolean(
        course.institutionId &&
          user?.memberships?.some(
            (membership) =>
              membership.institutionId === course.institutionId &&
              (membership.role === Role.FACULTY || membership.role === Role.INSTITUTION_ADMIN),
          ),
      );

    if (!isPrivileged) {
      if (course.status !== CourseStatus.PUBLISHED) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      if (
        course.institutionId &&
        !user?.memberships?.some((membership) => membership.institutionId === course.institutionId)
      ) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
    }

    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(id, user);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCourse(id: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(id, user);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------
  // MODULE MANAGEMENT
  // ----------------------------------------------------

  async createModule(courseId: string, dto: CreateModuleDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    const highestOrderModule = await this.prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = dto.order ?? (highestOrderModule ? highestOrderModule.order + 1 : 0);

    return this.prisma.module.create({
      data: {
        title: dto.title,
        description: dto.description,
        order: nextOrder,
        courseId,
      },
      include: {
        lessons: true,
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

    const highestOrderLesson = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = dto.order ?? (highestOrderLesson ? highestOrderLesson.order + 1 : 0);

    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        content: dto.content,
        order: nextOrder,
        moduleId,
      },
    });
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto, user: CurrentUserPayload) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
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
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    this.assertCourseAuthorOrAdmin(lesson.module.course, user);

    return this.prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  async getLesson(lessonId: string, user: CurrentUserPayload) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, status: true, createdById: true, institutionId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const course = lesson.module.course;
    const isSuperAdmin =
      user.globalRole === Role.SUPER_ADMIN ||
      user.globalRole === Role.PLATFORM_ADMIN;
    const isAuthor = course.createdById === user.id;
    const isInstitutionStaff =
      course.institutionId &&
      user.memberships?.some(
        (m) =>
          m.institutionId === course.institutionId &&
          (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN),
      );

    if (!isSuperAdmin && !isAuthor && !isInstitutionStaff) {
      if (course.status !== CourseStatus.PUBLISHED) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
      });

      if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
        throw new ForbiddenException('You must be enrolled in this course to view its lessons');
      }
    }

    const progress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
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

  async enrollStudent(courseId: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);

    const isSuperAdmin =
      user.globalRole === Role.SUPER_ADMIN ||
      user.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      if (course.status !== CourseStatus.PUBLISHED) {
        throw new ForbiddenException('You cannot enroll in an unpublished course');
      }
      if (course.institutionId) {
        const isMember = user.memberships?.some((m) => m.institutionId === course.institutionId);
        if (!isMember) {
          throw new ForbiddenException('You can only enroll in courses offered by your institution');
        }
      }
    }

    return this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
      },
      create: {
        userId: user.id,
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
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('You must be enrolled in this course to update lesson progress');
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

  async getCourseProgress(courseId: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return { totalLessons: 0, completedLessons: 0, progressPercent: 0 };
    }

    const completedCount = await this.prisma.lessonProgress.count({
      where: {
        userId: user.id,
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

    const isInstitutionAdmin = user.memberships?.some(
      (m) => m.institutionId === course.institutionId && m.role === Role.INSTITUTION_ADMIN,
    );

    if (isInstitutionAdmin) {
      return;
    }

    throw new ForbiddenException('You do not have permission to modify this course');
  }

  private assertInstitutionAssignment(institutionId: string | undefined, user?: CurrentUserPayload) {
    if (!institutionId) {
      return;
    }
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const canManageInstitution = user.memberships?.some(
      (membership) =>
        membership.institutionId === institutionId &&
        (membership.role === Role.INSTITUTION_ADMIN || membership.role === Role.FACULTY),
    );
    if (!canManageInstitution) {
      throw new ForbiddenException('You can only create courses in your assigned institution');
    }
  }
}
