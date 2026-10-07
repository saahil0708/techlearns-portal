import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Prisma, ProblemDifficulty, ProblemStatus, Role, SubmissionVerdict } from '@prisma/client';
import { AppCacheService } from '../common/cache/app-cache.service.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';

@Injectable()
export class ProblemsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private cacheService?: AppCacheService,
  ) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async assertValidCourseMapping(
    courseId?: string | null,
    moduleId?: string | null,
    lessonId?: string | null,
    problemInstitutionId?: string | null,
    user?: CurrentUserPayload,
  ) {
    if (!courseId) {
      if (moduleId || lessonId) {
        throw new BadRequestException('Cannot associate a module or lesson without specifying a valid courseId');
      }
      return { moduleId: null };
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (user) {
      const isPrivileged =
        user.globalRole === Role.SUPER_ADMIN ||
        user.globalRole === Role.PLATFORM_ADMIN ||
        course.createdById === user.id ||
        Boolean(
          course.institutionId &&
            user.memberships?.some(
              (m) =>
                m.institutionId === course.institutionId &&
                (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN),
            ),
        );

      if (!isPrivileged) {
        throw new ForbiddenException('You do not have permission to associate problems with this course');
      }
    }

    if (!problemInstitutionId && course.institutionId) {
      throw new BadRequestException('A global problem cannot be linked to an institution-scoped course');
    }

    if (problemInstitutionId && course.institutionId && problemInstitutionId !== course.institutionId) {
      throw new BadRequestException('Course belongs to a different institution than the problem');
    }

    let resolvedModuleId = moduleId || null;

    if (moduleId) {
      const moduleItem = await this.prisma.module.findUnique({
        where: { id: moduleId },
      });
      if (!moduleItem) {
        throw new NotFoundException(`Module with ID ${moduleId} not found`);
      }
      if (moduleItem.courseId !== courseId) {
        throw new BadRequestException(`Referenced module ${moduleId} does not belong to course ${courseId}`);
      }
    }

    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: true },
      });
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }
      if (moduleId && lesson.moduleId !== moduleId) {
        throw new BadRequestException(`Referenced lesson ${lessonId} does not belong to module ${moduleId}`);
      }
      if (lesson.module?.courseId !== courseId) {
        throw new BadRequestException(`Referenced lesson ${lessonId} belongs to a module outside course ${courseId}`);
      }
      if (!resolvedModuleId && lesson.moduleId) {
        resolvedModuleId = lesson.moduleId;
      }
    }

    return { moduleId: resolvedModuleId };
  }

  async create(input: CreateProblemInput, creatorId: string, user?: CurrentUserPayload) {
    const institutionId = input.institutionId || input.collegeId || null;
    this.assertInstitutionAssignment(institutionId || undefined, user);
    const validatedCoursePlacement = await this.assertValidCourseMapping(
      input.courseId,
      input.moduleId,
      input.lessonId,
      institutionId,
      user,
    );
    const resolvedModuleId = validatedCoursePlacement?.moduleId ?? input.moduleId ?? null;
    const slug = input.slug || this.slugify(input.title);

    const existing = await this.prisma.problem.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Problem with slug "${slug}" already exists`);
    }

    return this.prisma.problem.create({
      data: {
        title: input.title,
        slug,
        statement: input.statement,
        inputFormat: input.inputFormat,
        outputFormat: input.outputFormat,
        constraints: input.constraints,
        difficulty: input.difficulty,
        timeLimit: input.timeLimit,
        memoryLimit: input.memoryLimit,
        institutionId,
        courseId: input.courseId || null,
        createdById: creatorId,
        status: input.status || ProblemStatus.PUBLISHED,
        testCases: input.testCases
          ? {
              create: input.testCases.map((tc, index) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden !== undefined ? tc.isHidden : true,
                explanation: tc.explanation,
                order: tc.order ?? index,
              })),
            }
          : undefined,
        courseMappings: input.courseId
          ? {
              create: {
                courseId: input.courseId,
                moduleId: resolvedModuleId,
                lessonId: input.lessonId || null,
                points: input.difficulty === ProblemDifficulty.EASY ? 100 : input.difficulty === ProblemDifficulty.HARD ? 350 : 200,
              },
            }
          : undefined,
      },
      include: {
        testCases: true,
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
    });
  }

  async findPaginated(
    args: PaginationArgs,
    difficulty?: ProblemDifficulty,
    status?: ProblemStatus,
    institutionId?: string,
    courseId?: string,
    user?: CurrentUserPayload,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const targetInstId = institutionId;
    const where: Prisma.ProblemWhereInput = {};

    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { slug: { contains: args.search, mode: 'insensitive' } },
        { statement: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      // Non-admins can only see PUBLISHED problems
      where.status = ProblemStatus.PUBLISHED;

      // Restrict institution problems to user's institutions or public (null)
      const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
      if (targetInstId) {
        if (!userInstitutionIds.includes(targetInstId)) {
          where.institutionId = '__unauthorized_institution__';
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
    } else {
      if (status) {
        where.status = status;
      }
      if (targetInstId) {
        where.institutionId = targetInstId;
      }
    }

    const orderBy: Prisma.ProblemOrderByWithRelationInput = {};
    if (args.sortBy && ['title', 'slug', 'difficulty', 'status', 'timeLimit', 'memoryLimit', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
      orderBy[args.sortBy as keyof Prisma.ProblemOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          testCases: {
            where: isSuperAdmin ? {} : { isHidden: false },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              submissions: true,
              testCases: true,
            },
          },
        },
      }),
      this.prisma.problem.count({ where }),
    ]);

    const problemIds = items.map((p) => p.id);
    const acceptedCounts = problemIds.length > 0 ? await this.prisma.submission.groupBy({
      by: ['problemId'],
      where: {
        problemId: { in: problemIds },
        verdict: SubmissionVerdict.ACCEPTED,
      },
      _count: { id: true },
    }) : [];
    const acceptedMap = new Map(acceptedCounts.map((c) => [c.problemId, c._count.id]));

    const mappedItems = items.map((p) => {
      const totalSubmissions = p._count?.submissions || 0;
      const acceptedSubmissions = acceptedMap.get(p.id) || 0;
      const acceptanceRate = totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;
      const points = p.difficulty === ProblemDifficulty.EASY ? 100 : p.difficulty === ProblemDifficulty.HARD ? 350 : 200;
      return {
        ...p,
        points,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByIdOrSlug(idOrSlug: string, user?: CurrentUserPayload) {
    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    const problem = await this.prisma.problem.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem ${idOrSlug} not found`);
    }

    const isOwner = user && problem.createdById === user.id;
    const isInstitutionStaff =
      user &&
      problem.institutionId &&
      user.memberships?.some(
        (m) =>
          m.institutionId === problem.institutionId &&
          (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN),
      );

    const hasPrivilegedAccess = isSuperAdmin || isOwner || isInstitutionStaff;

    if (!hasPrivilegedAccess) {
      if (problem.status !== ProblemStatus.PUBLISHED) {
        throw new NotFoundException(`Problem ${idOrSlug} not found`);
      }
      if (problem.institutionId) {
        const isMember = user?.memberships?.some(
          (m) => m.institutionId === problem.institutionId,
        );
        if (!isMember) {
          throw new NotFoundException(`Problem ${idOrSlug} not found`);
        }
      }
    }

    const [testCases, acceptedSubmissions] = await Promise.all([
      this.prisma.testCase?.findMany
        ? this.prisma.testCase.findMany({
            where: {
              problemId: problem.id,
              ...(hasPrivilegedAccess ? {} : { isHidden: false }),
            },
            orderBy: { order: 'asc' },
          })
        : Promise.resolve([]),
      this.prisma.submission?.count
        ? this.prisma.submission.count({
            where: {
              problemId: problem.id,
              verdict: SubmissionVerdict.ACCEPTED,
            },
          })
        : Promise.resolve(0),
    ]);

    const totalSubmissions = problem._count?.submissions || 0;
    const acceptanceRate = totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;
    const points = problem.difficulty === ProblemDifficulty.EASY ? 100 : problem.difficulty === ProblemDifficulty.HARD ? 350 : 200;

    return {
      ...problem,
      testCases,
      points,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
    };
  }

  async update(id: string, input: UpdateProblemInput, user?: CurrentUserPayload) {
    const existing = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        courseMappings: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    this.assertProblemAuthorOrAdmin(existing, user);

    const { moduleId, lessonId, courseId, institutionId, ...problemData } = input;

    const targetInstitutionId =
      institutionId !== undefined ? (institutionId || null) : existing.institutionId;

    if (institutionId !== undefined && institutionId !== existing.institutionId) {
      this.assertInstitutionAssignment(institutionId || undefined, user);
    }

    const targetCourseId = courseId !== undefined ? (courseId || null) : existing.courseId;
    const isCourseChanged = courseId !== undefined && (courseId || null) !== existing.courseId;
    const existingMapping =
      existing.courseMappings?.find((m) => m.courseId === existing.courseId) ||
      existing.courseMappings?.[0] ||
      null;

    const targetModuleId = !targetCourseId
      ? null
      : isCourseChanged
        ? (moduleId !== undefined ? (moduleId || null) : null)
        : (moduleId !== undefined ? (moduleId || null) : (lessonId ? null : (existingMapping?.moduleId || null)));

    const targetLessonId = !targetCourseId
      ? null
      : isCourseChanged
        ? (lessonId !== undefined ? (lessonId || null) : null)
        : (lessonId !== undefined ? (lessonId || null) : (moduleId !== undefined ? null : (existingMapping?.lessonId || null)));

    let resolvedModuleId = targetModuleId;
    if (
      courseId !== undefined ||
      moduleId !== undefined ||
      lessonId !== undefined ||
      institutionId !== undefined
    ) {
      const validatedCoursePlacement = await this.assertValidCourseMapping(
        targetCourseId,
        targetModuleId,
        targetLessonId,
        targetInstitutionId,
        user,
      );
      if (validatedCoursePlacement && validatedCoursePlacement.moduleId !== undefined) {
        resolvedModuleId = validatedCoursePlacement.moduleId;
      }
    }

    const updateData: Prisma.ProblemUpdateInput = {
      ...problemData,
    };

    if (institutionId !== undefined) {
      updateData.institution = institutionId
        ? { connect: { id: institutionId } }
        : { disconnect: true };
    }

    if (courseId !== undefined) {
      updateData.course = courseId ? { connect: { id: courseId } } : { disconnect: true };
    }

    const problem = await this.prisma.$transaction(async (tx) => {
      const updatedProblem = await tx.problem.update({
        where: { id },
        data: updateData,
        include: {
          testCases: true,
          _count: {
            select: {
              submissions: true,
              testCases: true,
            },
          },
        },
      });

      if (courseId !== undefined && !courseId) {
        await tx.courseProblem.deleteMany({
          where: { problemId: id },
        });
      } else if (
        targetCourseId &&
        (courseId !== undefined ||
          moduleId !== undefined ||
          lessonId !== undefined ||
          institutionId !== undefined ||
          input.difficulty !== undefined)
      ) {
        if (isCourseChanged) {
          await tx.courseProblem.deleteMany({
            where: { problemId: id, courseId: { not: targetCourseId } },
          });
        }

        await tx.courseProblem.upsert({
          where: {
            courseId_problemId: {
              courseId: targetCourseId,
              problemId: id,
            },
          },
          create: {
            courseId: targetCourseId,
            problemId: id,
            moduleId: resolvedModuleId,
            lessonId: targetLessonId,
            points:
              updatedProblem.difficulty === ProblemDifficulty.EASY
                ? 100
                : updatedProblem.difficulty === ProblemDifficulty.HARD
                  ? 350
                  : 200,
          },
          update: {
            moduleId: resolvedModuleId,
            lessonId: targetLessonId,
            ...(input.difficulty !== undefined && {
              points:
                updatedProblem.difficulty === ProblemDifficulty.EASY
                  ? 100
                  : updatedProblem.difficulty === ProblemDifficulty.HARD
                    ? 350
                    : 200,
            }),
          },
        });
      }

      return updatedProblem;
    });

    const courseMappings = await this.prisma.courseProblem.findMany({
      where: { problemId: id },
    });

    if (this.cacheService) {
      await this.cacheService.invalidatePrefix('problems:');
    }

    return {
      ...problem,
      courseMappings,
    };
  }

  async delete(id: string, user?: CurrentUserPayload) {
    const existing = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    this.assertProblemAuthorOrAdmin(existing, user);

    await this.prisma.problem.delete({
      where: { id },
    });

    if (this.cacheService) {
      await this.cacheService.invalidatePrefix('problems:');
    }

    return true;
  }

  async addTestCase(problemId: string, input: CreateTestCaseInput, user?: CurrentUserPayload) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

    this.assertProblemAuthorOrAdmin(problem, user);

    const tc = await this.prisma.testCase.create({
      data: {
        problemId,
        input: input.input,
        expectedOutput: input.expectedOutput,
        isHidden: input.isHidden !== undefined ? input.isHidden : true,
        explanation: input.explanation,
        order: input.order ?? 0,
      },
    });

    if (this.cacheService) {
      await this.cacheService.invalidatePrefix('problems:');
    }

    return tc;
  }

  async updateTestCase(problemId: string, testCaseId: string, input: Partial<CreateTestCaseInput>, user?: CurrentUserPayload) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

    this.assertProblemAuthorOrAdmin(problem, user);

    const tc = await this.prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        ...(input.input !== undefined && { input: input.input }),
        ...(input.expectedOutput !== undefined && { expectedOutput: input.expectedOutput }),
        ...(input.isHidden !== undefined && { isHidden: input.isHidden }),
        ...(input.explanation !== undefined && { explanation: input.explanation }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });

    if (this.cacheService) {
      await this.cacheService.invalidatePrefix('problems:');
    }

    return tc;
  }

  async deleteTestCase(problemId: string, testCaseId: string, user?: CurrentUserPayload) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

    this.assertProblemAuthorOrAdmin(problem, user);

    const tc = await this.prisma.testCase.delete({
      where: { id: testCaseId },
    });

    if (this.cacheService) {
      await this.cacheService.invalidatePrefix('problems:');
    }

    return tc;
  }

  async getTestCases(problemId: string, user?: CurrentUserPayload) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

    const isSuperAdmin = Boolean(
      user &&
        (user.globalRole === Role.SUPER_ADMIN ||
          user.globalRole === Role.PLATFORM_ADMIN),
    );
    const isOwner = Boolean(user && problem.createdById === user.id);
    const isInstitutionStaff = Boolean(
      user &&
        problem.institutionId &&
        user.memberships?.some(
          (m) =>
            m.institutionId === problem.institutionId &&
            (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN),
        ),
    );

    const hasPrivilegedAccess = isSuperAdmin || isOwner || isInstitutionStaff;

    if (!hasPrivilegedAccess) {
      if (problem.status !== ProblemStatus.PUBLISHED) {
        throw new NotFoundException(`Problem with ID ${problemId} not found`);
      }
      if (
        problem.institutionId &&
        !user?.memberships?.some((membership) => membership.institutionId === problem.institutionId)
      ) {
        throw new NotFoundException(`Problem with ID ${problemId} not found`);
      }
    }

    return this.prisma.testCase.findMany({
      where: {
        problemId,
        ...(hasPrivilegedAccess ? {} : { isHidden: false }),
      },
      orderBy: { order: 'asc' },
    });
  }

  private assertProblemAuthorOrAdmin(problem: { createdById: string; institutionId: string | null }, user?: CurrentUserPayload) {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    if (problem.createdById === user.id) {
      return;
    }
    if (problem.institutionId) {
      const isInstitutionAdmin = user.memberships?.some(
        (m) => m.institutionId === problem.institutionId && m.role === Role.INSTITUTION_ADMIN,
      );
      if (isInstitutionAdmin) {
        return;
      }
    }
    throw new ForbiddenException('You do not have permission to modify this problem');
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
      throw new ForbiddenException('You can only create problems in your assigned institution');
    }
  }
}
