import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role } from '@prisma/client';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { BulkImportCurriculumDto, BulkImportMode } from './dto/bulk-import-curriculum.dto.js';
import { CreateCompositeCourseDto } from './dto/create-composite-course.dto.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { EnrollBatchDto } from './dto/enroll-batch.dto.js';
import { QueryCourseRosterDto } from './dto/query-course-roster.dto.js';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto.js';
import { ReorderModulesDto } from './dto/reorder-modules.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueCourseSlug(
    title: string,
    customSlug?: string,
    excludeCourseId?: string,
  ): Promise<string> {
    let slug = customSlug ? this.slugify(customSlug) : this.slugify(title);
    if (!slug) {
      slug = `course-${Date.now()}`;
    }

    const existing = await this.prisma.course.findFirst({
      where: {
        slug,
        ...(excludeCourseId ? { id: { not: excludeCourseId } } : {}),
      },
    });

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return slug;
  }

  private async assertUniqueCourseCode(code?: string, excludeCourseId?: string) {
    if (!code || !code.trim()) return;
    const normalizedCode = code.trim().toUpperCase();
    const existing = await this.prisma.course.findFirst({
      where: {
        code: { equals: normalizedCode, mode: 'insensitive' },
        ...(excludeCourseId ? { id: { not: excludeCourseId } } : {}),
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Course code "${normalizedCode}" is already in use by course "${existing.title}". Course code must be unique.`,
      );
    }
  }

  private handlePrismaCourseError(err: any, code?: string): never {
    if (err?.code === 'P2002') {
      const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : (err?.meta?.target || 'field');
      if (typeof target === 'string' && target.includes('code')) {
        throw new BadRequestException(
          `Course code "${code ? code.trim().toUpperCase() : 'provided'}" is already in use by another course. Course code must be unique.`,
        );
      }
      if (typeof target === 'string' && target.includes('slug')) {
        throw new BadRequestException('Course slug is already in use. Course slug must be unique.');
      }
      throw new BadRequestException(`Unique constraint failed on course (${target}). Course code and slug must be unique.`);
    }
    throw err;
  }

  // ----------------------------------------------------
  // COURSE MANAGEMENT
  // ----------------------------------------------------

  async createCourse(userId: string, dto: CreateCourseDto, user?: CurrentUserPayload) {
    try {
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

      if (dto.code) {
        await this.assertUniqueCourseCode(dto.code);
      }

      const slug = await this.generateUniqueCourseSlug(dto.title, dto.slug);
      const normalizedCode = dto.code ? dto.code.trim().toUpperCase() : null;

      return await this.prisma.course.create({
        data: {
          title: dto.title,
          slug,
          code: normalizedCode,
          category: dto.category || null,
          level: dto.level || 'Beginner',
          thumbnailUrl: dto.thumbnailUrl || null,
          durationWeeks: dto.durationWeeks ?? 8,
          tags: dto.tags || [],
          learningOutcomes: dto.learningOutcomes || dto.learningItems || dto.whatYouWillLearn || [],
          description: dto.description || null,
          institutionId: institutionId || null,
          createdById: userId,
          status: dto.status || CourseStatus.DRAFT,
        },
        include: {
          createdBy: {
            select: userSanitizedSelect,
          },
          institution: {
            select: { id: true, name: true, code: true },
          },
        },
      });
    } catch (err: any) {
      this.handlePrismaCourseError(err, dto.code);
    }
  }

  async createCompositeCourse(
    userId: string,
    dto: CreateCompositeCourseDto,
    user?: CurrentUserPayload,
  ) {
    try {
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

      if (dto.code) {
        await this.assertUniqueCourseCode(dto.code);
      }

      const slug = await this.generateUniqueCourseSlug(dto.title, dto.slug);
      const normalizedCode = dto.code ? dto.code.trim().toUpperCase() : null;

      return await this.prisma.$transaction(async (tx) => {
        const course = await tx.course.create({
          data: {
            title: dto.title,
            slug,
            code: normalizedCode,
            category: dto.category || null,
            level: dto.level || 'Beginner',
            thumbnailUrl: dto.thumbnailUrl || null,
            durationWeeks: dto.durationWeeks ?? 8,
            tags: dto.tags || [],
            learningOutcomes: dto.learningOutcomes || dto.learningItems || dto.whatYouWillLearn || [],
            description: dto.description || null,
            institutionId: institutionId || null,
            createdById: userId,
            status: dto.status || CourseStatus.DRAFT,
          },
        });

        if (dto.modules && dto.modules.length > 0) {
          for (let mIdx = 0; mIdx < dto.modules.length; mIdx++) {
            const mod = dto.modules[mIdx];
            const createdModule = await tx.module.create({
              data: {
                courseId: course.id,
                title: mod.title,
                description: mod.description || null,
                order: mod.order ?? mIdx,
              },
            });

            if (mod.lessons && mod.lessons.length > 0) {
              for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
                const lesson = mod.lessons[lIdx];
                await tx.lesson.create({
                  data: {
                    moduleId: createdModule.id,
                    title: lesson.title,
                    content: lesson.content || '',
                    type: lesson.type || 'reading',
                    durationMinutes: lesson.durationMinutes ?? 15,
                    quizMCQ: (lesson.quizMCQ as any) ?? null,
                    codingProblem: (lesson.codingProblem as any) ?? null,
                    order: lesson.order ?? lIdx,
                  },
                });
              }
            }
          }
        }

        return tx.course.findUniqueOrThrow({
          where: { id: course.id },
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
                },
              },
            },
            _count: {
              select: { modules: true, enrollments: true },
            },
          },
        });
      });
    } catch (err: any) {
      this.handlePrismaCourseError(err, dto.code);
    }
  }

  async findAll(institutionId?: string, status?: CourseStatus, user?: CurrentUserPayload) {
    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    const targetInstId = institutionId;
    const conditions: any[] = [];

    if (isSuperAdmin) {
      if (targetInstId) conditions.push({ institutionId: targetInstId });
      if (status) conditions.push({ status });
    } else {
      // 1. Explicit status filter if requested
      if (status) {
        conditions.push({ status });
      }

      // 2. Authorization-based visibility predicate applied independently
      const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
      if (targetInstId) {
        if (!user || !userInstitutionIds.includes(targetInstId)) {
          conditions.push({ institutionId: targetInstId, status: CourseStatus.PUBLISHED });
        } else {
          conditions.push({ institutionId: targetInstId });
        }
      } else {
        if (!user) {
          conditions.push({ status: CourseStatus.PUBLISHED });
        } else {
          conditions.push({
            OR: [
              { status: CourseStatus.PUBLISHED },
              ...(userInstitutionIds.length > 0 ? [{ institutionId: { in: userInstitutionIds } }] : []),
            ],
          });
        }
      }
    }

    const where: any = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    return this.prisma.course.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        institution: {
          select: { id: true, name: true, code: true },
        },
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
    const conditions: any[] = [];

    if (args.search) {
      conditions.push({
        OR: [
          { title: { contains: args.search, mode: 'insensitive' } },
          { description: { contains: args.search, mode: 'insensitive' } },
          { code: { contains: args.search, mode: 'insensitive' } },
        ],
      });
    }

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (isSuperAdmin) {
      if (targetInstId) conditions.push({ institutionId: targetInstId });
      if (status) conditions.push({ status });
    } else {
      // 1. Explicit status filter if requested
      if (status) {
        conditions.push({ status });
      }

      // 2. Authorization-based visibility predicate applied independently
      const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
      if (targetInstId) {
        if (!user || !userInstitutionIds.includes(targetInstId)) {
          conditions.push({ institutionId: targetInstId, status: CourseStatus.PUBLISHED });
        } else {
          conditions.push({ institutionId: targetInstId });
        }
      } else {
        if (!user) {
          conditions.push({ status: CourseStatus.PUBLISHED });
        } else {
          conditions.push({
            OR: [
              { status: CourseStatus.PUBLISHED },
              ...(userInstitutionIds.length > 0 ? [{ institutionId: { in: userInstitutionIds } }] : []),
            ],
          });
        }
      }
    }

    const where: any = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy: any = {};
    if (args.sortBy && ['title', 'status', 'createdAt', 'updatedAt', 'level', 'category'].includes(args.sortBy)) {
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
          institution: {
            select: { id: true, name: true, code: true },
          },
          createdBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
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

  async findCourseById(idOrSlug: string, user?: CurrentUserPayload) {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
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
                moduleId: true,
                title: true,
                content: true,
                type: true,
                durationMinutes: true,
                quizMCQ: true,
                codingProblem: true,
                order: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true, modules: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID or slug '${idOrSlug}' not found`);
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
        throw new NotFoundException(`Course with ID or slug '${idOrSlug}' not found`);
      }
      if (
        course.institutionId &&
        !user?.memberships?.some((membership) => membership.institutionId === course.institutionId)
      ) {
        throw new NotFoundException(`Course with ID or slug '${idOrSlug}' not found`);
      }
    }

    let hasContentAccess = isPrivileged;
    let userEnrollment: any = null;
    if (!hasContentAccess && user?.id) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
      });
      if (
        enrollment &&
        (enrollment.status === EnrollmentStatus.ACTIVE || enrollment.status === EnrollmentStatus.COMPLETED)
      ) {
        hasContentAccess = true;
        userEnrollment = enrollment;
      }
    }

    let completedLessonIdSet = new Set<string>();
    let progressByLessonId: Record<string, any> = {};
    if (user?.id) {
      const allLessonIds = (course.modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
      if (allLessonIds.length > 0) {
        const progressList = await (this.prisma.lessonProgress as any).findMany({
          where: {
            userId: user.id,
            lessonId: { in: allLessonIds },
          },
        });
        progressList.forEach((p: any) => {
          if (p.completed) {
            completedLessonIdSet.add(p.lessonId);
          }
          progressByLessonId[p.lessonId] = {
            completed: p.completed,
            completedAt: p.completedAt,
            quizAttempt: p.quizAttempt,
            codeSubmission: p.codeSubmission,
            lastAttemptAt: p.lastAttemptAt,
          };
        });
      }
    }

    if (!hasContentAccess) {
      return {
        ...course,
        isEnrolled: false,
        userEnrollment: null,
        completedLessonIds: Array.from(completedLessonIdSet),
        modules: (course.modules || []).map((mod) => ({
          ...mod,
          lessons: (mod.lessons || []).map((lesson) => {
            const {
              content: _strippedContent,
              quizMCQ: _strippedQuiz,
              codingProblem: _strippedCoding,
              ...rest
            } = lesson;
            return {
              ...rest,
              moduleId: lesson.moduleId || mod.id,
              content: '',
              isCompleted: completedLessonIdSet.has(lesson.id),
              userProgress: progressByLessonId[lesson.id] || null,
            };
          }),
        })),
      };
    }

    return {
      ...course,
      isEnrolled: true,
      userEnrollment: userEnrollment || { status: EnrollmentStatus.ACTIVE, enrolledAt: new Date() },
      completedLessonIds: Array.from(completedLessonIdSet),
      modules: (course.modules || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((lesson) => ({
          ...lesson,
          moduleId: lesson.moduleId || mod.id,
          isCompleted: completedLessonIdSet.has(lesson.id),
          userProgress: progressByLessonId[lesson.id] || null,
        })),
      })),
    };
  }

  async updateCourse(id: string, dto: UpdateCourseDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(id, user);
    this.assertCourseAuthorOrAdmin(course, user);

    let slug = course.slug;
    if (dto.slug || dto.title) {
      slug = await this.generateUniqueCourseSlug(dto.title || course.title, dto.slug, course.id);
    }

    if (dto.code !== undefined && dto.code) {
      await this.assertUniqueCourseCode(dto.code, course.id);
    }

    const normalizedCode = dto.code !== undefined ? (dto.code ? dto.code.trim().toUpperCase() : null) : undefined;

    const targetInstitutionId = dto.institutionId !== undefined ? dto.institutionId : (dto.collegeId !== undefined ? dto.collegeId : course.institutionId);
    if (targetInstitutionId && targetInstitutionId !== course.institutionId) {
      this.assertInstitutionAssignment(targetInstitutionId, user);
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(slug !== undefined && { slug }),
        ...(normalizedCode !== undefined && { code: normalizedCode }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
        ...(dto.durationWeeks !== undefined && { durationWeeks: dto.durationWeeks }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.learningOutcomes !== undefined
          ? { learningOutcomes: dto.learningOutcomes }
          : dto.learningItems !== undefined
            ? { learningOutcomes: dto.learningItems }
            : dto.whatYouWillLearn !== undefined
              ? { learningOutcomes: dto.whatYouWillLearn }
              : {}),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.institutionId !== undefined || dto.collegeId !== undefined ? { institutionId: targetInstitutionId || null } : {}),
      },
      include: {
        createdBy: {
          select: userSanitizedSelect,
        },
        institution: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async deleteCourse(id: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(id, user);
    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async bulkImportCurriculum(
    courseId: string,
    dto: BulkImportCurriculumDto,
    user: CurrentUserPayload,
  ) {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    if (!dto.modules || dto.modules.length === 0) {
      throw new BadRequestException('No modules provided for curriculum import');
    }

    const mode = dto.mode || BulkImportMode.APPEND;

    return this.prisma.$transaction(async (tx) => {
      let startModuleOrder = 0;

      if (mode === BulkImportMode.REPLACE) {
        // Remove existing modules and cascading lessons
        await tx.module.deleteMany({
          where: { courseId },
        });
      } else {
        const lastMod = await tx.module.findFirst({
          where: { courseId },
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        if (lastMod && typeof lastMod.order === 'number') {
          startModuleOrder = lastMod.order + 1;
        }
      }

      for (let mIdx = 0; mIdx < dto.modules.length; mIdx++) {
        const mod = dto.modules[mIdx];
        const createdModule = await tx.module.create({
          data: {
            courseId,
            title: mod.title?.trim() || `Module ${startModuleOrder + mIdx + 1}`,
            description: mod.description?.trim() || null,
            order: mod.order ?? startModuleOrder + mIdx,
          },
        });

        if (mod.lessons && mod.lessons.length > 0) {
          for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
            const lesson = mod.lessons[lIdx];
            await tx.lesson.create({
              data: {
                moduleId: createdModule.id,
                title: lesson.title?.trim() || `Lesson ${lIdx + 1}`,
                content: lesson.content || '',
                type: lesson.type || 'reading',
                durationMinutes: lesson.durationMinutes ?? 15,
                quizMCQ: (lesson.quizMCQ as any) ?? null,
                codingProblem: (lesson.codingProblem as any) ?? null,
                order: lesson.order ?? lIdx,
              },
            });
          }
        }
      }

      return tx.course.findUniqueOrThrow({
        where: { id: courseId },
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
              },
            },
          },
          _count: {
            select: { modules: true, enrollments: true },
          },
        },
      });
    });
  }

  async publishCourse(courseId: string, user: CurrentUserPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    this.assertCourseAuthorOrAdmin(course, user);

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (course.modules.length === 0 || totalLessons === 0) {
      throw new BadRequestException(
        'Cannot publish course: course must contain at least one module and at least one lesson.',
      );
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.PUBLISHED },
      include: {
        createdBy: { select: userSanitizedSelect },
        institution: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async unpublishCourse(courseId: string, user: CurrentUserPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    this.assertCourseAuthorOrAdmin(course, user);

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.DRAFT },
      include: {
        createdBy: { select: userSanitizedSelect },
        institution: { select: { id: true, name: true, code: true } },
      },
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

  async reorderModules(courseId: string, dto: ReorderModulesDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    await this.prisma.$transaction(
      dto.modules.map((item) =>
        this.prisma.module.updateMany({
          where: { id: item.id, courseId },
          data: { order: item.order },
        }),
      ),
    );

    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
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
        content: dto.content || '',
        type: dto.type || 'reading',
        durationMinutes: dto.durationMinutes ?? 15,
        quizMCQ: (dto.quizMCQ as any) ?? null,
        codingProblem: (dto.codingProblem as any) ?? null,
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
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.quizMCQ !== undefined && { quizMCQ: dto.quizMCQ as any }),
        ...(dto.codingProblem !== undefined && { codingProblem: dto.codingProblem as any }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
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

  async reorderLessons(moduleId: string, dto: ReorderLessonsDto, user: CurrentUserPayload) {
    const moduleItem = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!moduleItem) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    this.assertCourseAuthorOrAdmin(moduleItem.course, user);

    await this.prisma.$transaction(
      dto.lessons.map((item) =>
        this.prisma.lesson.updateMany({
          where: { id: item.id, moduleId },
          data: { order: item.order },
        }),
      ),
    );

    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
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

    const isPrivileged = Boolean(isSuperAdmin || isAuthor || isInstitutionStaff);

    if (!isPrivileged) {
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

      if (
        !enrollment ||
        (enrollment.status !== EnrollmentStatus.ACTIVE && enrollment.status !== EnrollmentStatus.COMPLETED)
      ) {
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

    let sanitizedQuiz = lesson.quizMCQ;
    if (!isPrivileged && sanitizedQuiz && typeof sanitizedQuiz === 'object') {
      const { correctIndex: _strippedCorrectIndex, ...restQuiz } = sanitizedQuiz as any;
      sanitizedQuiz = restQuiz;
    }

    return {
      ...lesson,
      quizMCQ: sanitizedQuiz,
      completed: progress?.completed ?? false,
    };
  }

  // ----------------------------------------------------
  // ENROLLMENTS & ROSTER MANAGEMENT
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

  async unenrollStudent(courseId: string, user: CurrentUserPayload, targetUserId?: string) {
    const targetId = targetUserId || user.id;

    if (targetId !== user.id) {
      const course = await this.findCourseById(courseId, user);
      this.assertCourseAuthorOrAdmin(course, user);
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: targetId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment record for user ${targetId} in course ${courseId} not found`);
    }

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: targetId,
          courseId,
        },
      },
      data: {
        status: EnrollmentStatus.DROPPED,
      },
    });
  }

  async enrollBatchStudents(courseId: string, dto: EnrollBatchDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    const batch = await this.prisma.batch.findUnique({
      where: { id: dto.batchId },
      include: {
        students: {
          select: { userId: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${dto.batchId} not found`);
    }

    if (course.institutionId && batch.institutionId !== course.institutionId) {
      throw new ForbiddenException('Batch does not belong to the same institution as this course');
    }

    const studentUserIds = Array.from(new Set(batch.students.map((s) => s.userId)));

    if (studentUserIds.length === 0) {
      return {
        courseId,
        batchId: dto.batchId,
        batchName: batch.name,
        totalBatchStudents: 0,
        enrolledCount: 0,
      };
    }

    const results = await this.prisma.$transaction(
      studentUserIds.map((userId) =>
        this.prisma.enrollment.upsert({
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
        }),
      ),
    );

    return {
      courseId,
      batchId: dto.batchId,
      batchName: batch.name,
      totalBatchStudents: studentUserIds.length,
      enrolledCount: results.length,
    };
  }

  async getEnrolledCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        userId,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      },
      include: {
        course: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
            institution: {
              select: { id: true, name: true, code: true },
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

  async getCourseRoster(courseId: string, query: QueryCourseRosterDto, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    const where: any = {
      courseId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.user = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { rollNo: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              rollNo: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    // Aggregate progress stats for the roster slice
    const studentUserIds = enrollments.map((e) => e.userId);
    const progressRecords = await this.prisma.lessonProgress.findMany({
      where: {
        userId: { in: studentUserIds },
        lessonId: { in: lessonIds },
        completed: true,
      },
      select: {
        userId: true,
        lessonId: true,
        completedAt: true,
      },
    });

    const items = enrollments.map((enrollment) => {
      const studentProgress = progressRecords.filter((p) => p.userId === enrollment.userId);
      const completedLessons = studentProgress.length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const lastActiveDates = studentProgress
        .map((p) => p.completedAt)
        .filter((d): d is Date => d !== null);

      const lastActiveAt =
        lastActiveDates.length > 0
          ? new Date(Math.max(...lastActiveDates.map((d) => d.getTime())))
          : enrollment.enrolledAt;

      return {
        id: enrollment.id,
        userId: enrollment.userId,
        student: enrollment.user,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        completedLessons,
        totalLessons,
        progressPercent,
        lastActiveAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      course: {
        id: course.id,
        title: course.title,
        totalLessons,
      },
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async exportCourseRosterCsv(courseId: string, user: CurrentUserPayload): Promise<string> {
    const course = await this.findCourseById(courseId, user);
    this.assertCourseAuthorOrAdmin(course, user);

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNo: true,
          },
        },
      },
    });

    const studentUserIds = enrollments.map((e) => e.userId);
    const progressRecords = await this.prisma.lessonProgress.findMany({
      where: {
        userId: { in: studentUserIds },
        lessonId: { in: lessonIds },
        completed: true,
      },
      select: {
        userId: true,
        completedAt: true,
      },
    });

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = [
      'Student Name',
      'Email',
      'Roll No',
      'Status',
      'Completed Lessons',
      'Total Lessons',
      'Progress (%)',
      'Enrolled At',
      'Last Active At',
    ].map(escapeCsv).join(',');

    const rows = enrollments.map((enrollment) => {
      const studentProgress = progressRecords.filter((p) => p.userId === enrollment.userId);
      const completedLessons = studentProgress.length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const lastActiveDates = studentProgress
        .map((p) => p.completedAt)
        .filter((d): d is Date => d !== null);

      const lastActiveAt =
        lastActiveDates.length > 0
          ? new Date(Math.max(...lastActiveDates.map((d) => d.getTime()))).toISOString()
          : enrollment.enrolledAt.toISOString();

      return [
        escapeCsv(enrollment.user.name),
        escapeCsv(enrollment.user.email),
        escapeCsv(enrollment.user.rollNo || 'N/A'),
        escapeCsv(enrollment.status),
        escapeCsv(completedLessons),
        escapeCsv(totalLessons),
        escapeCsv(progressPercent),
        escapeCsv(enrollment.enrolledAt.toISOString()),
        escapeCsv(lastActiveAt),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  // ----------------------------------------------------
  // PROGRESS & QUIZZES
  // ----------------------------------------------------

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

    if (!enrollment) {
      // Auto-enroll student into the course upon completing or updating a lesson
      await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.module.courseId,
          },
        },
        create: {
          userId,
          courseId: lesson.module.courseId,
          status: EnrollmentStatus.ACTIVE,
        },
        update: {
          status: EnrollmentStatus.ACTIVE,
        },
      });
    }

    const progress = await this.prisma.lessonProgress.upsert({
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

    if (completed) {
      await this.checkAndCompleteCourseEnrollment(lesson.module.courseId, userId);
    }

    return progress;
  }

  async getCourseProgress(courseId: string, user: CurrentUserPayload) {
    const course = await this.findCourseById(courseId, user);

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return { totalLessons: 0, completedLessons: 0, progressPercent: 0, completedLessonIds: [] };
    }

    const completedProgress = await this.prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: { in: lessonIds },
        completed: true,
      },
      select: { lessonId: true },
    });

    const completedLessonIds = completedProgress.map((p) => p.lessonId);

    return {
      totalLessons,
      completedLessons: completedLessonIds.length,
      progressPercent: Math.round((completedLessonIds.length / totalLessons) * 100),
      completedLessonIds,
    };
  }

  async submitQuiz(
    lessonId: string,
    userOrId: CurrentUserPayload | string,
    selectedOption: number,
  ) {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const currentUser = typeof userOrId === 'object' ? userOrId : undefined;

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
                createdById: true,
                institutionId: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const course = lesson.module.course;
    if (currentUser) {
      const isSuperAdmin =
        currentUser.globalRole === Role.SUPER_ADMIN ||
        currentUser.globalRole === Role.PLATFORM_ADMIN;
      const isAuthor = course.createdById === currentUser.id;
      const isInstitutionStaff =
        course.institutionId &&
        currentUser.memberships?.some(
          (m) =>
            m.institutionId === course.institutionId &&
            (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN),
        );

      if (!isSuperAdmin && !isAuthor && !isInstitutionStaff) {
        if (course.status !== CourseStatus.PUBLISHED) {
          throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
        if (
          course.institutionId &&
          !currentUser.memberships?.some((m) => m.institutionId === course.institutionId)
        ) {
          throw new ForbiddenException('You do not have access to this institution course');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: course.id,
            },
          },
        });
        if (
          !enrollment ||
          (enrollment.status !== EnrollmentStatus.ACTIVE && enrollment.status !== EnrollmentStatus.COMPLETED)
        ) {
          throw new ForbiddenException('You must be enrolled in this course to submit quizzes');
        }
      }
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });
      if (
        !enrollment ||
        (enrollment.status !== EnrollmentStatus.ACTIVE && enrollment.status !== EnrollmentStatus.COMPLETED)
      ) {
        throw new ForbiddenException('You must be enrolled in this course to submit quizzes');
      }
    }

    const quizData = lesson.quizMCQ as any;
    if (
      !quizData ||
      !Array.isArray(quizData.options) ||
      quizData.options.length === 0 ||
      typeof quizData.correctIndex !== 'number' ||
      !Number.isInteger(quizData.correctIndex) ||
      quizData.correctIndex < 0 ||
      quizData.correctIndex >= quizData.options.length
    ) {
      throw new BadRequestException('This lesson does not contain a valid quiz structure');
    }

    if (
      typeof selectedOption !== 'number' ||
      !Number.isInteger(selectedOption) ||
      selectedOption < 0 ||
      selectedOption >= quizData.options.length
    ) {
      throw new BadRequestException('Invalid option selected');
    }

    const isCorrect = selectedOption === quizData.correctIndex;
    const quizAttemptData: Record<string, any> = {
      selectedOption,
      isCorrect,
      explanation:
        quizData.explanation ||
        (isCorrect ? 'Correct choice!' : 'Incorrect. Review the lesson notes.'),
      attemptedAt: new Date().toISOString(),
    };
    if (isCorrect) {
      quizAttemptData.correctIndex = quizData.correctIndex;
    }

    // Automatically record lesson progress and store attempt in DB
    await (this.prisma.lessonProgress as any).upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        completed: isCorrect,
        completedAt: isCorrect ? new Date() : null,
        quizAttempt: quizAttemptData,
        lastAttemptAt: new Date(),
      },
      update: {
        completed: isCorrect ? true : undefined,
        completedAt: isCorrect ? new Date() : undefined,
        quizAttempt: quizAttemptData,
        lastAttemptAt: new Date(),
      },
    });

    if (isCorrect) {
      await this.checkAndCompleteCourseEnrollment(course.id, userId);
    }

    return {
      isCorrect,
      selectedOption,
      ...(isCorrect ? { correctIndex: quizData.correctIndex } : {}),
      explanation:
        quizData.explanation ||
        (isCorrect ? 'Correct choice!' : 'Incorrect. Review the lesson notes.'),
      quizAttempt: quizAttemptData,
    };
  }

  private async checkAndCompleteCourseEnrollment(courseId: string, userId: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      });
      if (!course) return;
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      if (lessonIds.length === 0) return;

      const completedCount = await (this.prisma.lessonProgress as any).count({
        where: {
          userId,
          lessonId: { in: lessonIds },
          completed: true,
        },
      });

      if (completedCount >= lessonIds.length) {
        await this.prisma.enrollment.updateMany({
          where: {
            userId,
            courseId,
            status: EnrollmentStatus.ACTIVE,
          },
          data: {
            status: EnrollmentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }
    } catch {
      // Non-blocking progress sync
    }
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

    const isInstitutionStaff = user.memberships?.some(
      (m) =>
        m.institutionId === course.institutionId &&
        (m.role === Role.INSTITUTION_ADMIN || m.role === Role.FACULTY),
    );

    if (isInstitutionStaff) {
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
