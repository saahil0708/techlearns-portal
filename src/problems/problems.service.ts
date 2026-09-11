import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProblemDifficulty, ProblemStatus, Role } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(input: CreateProblemInput, creatorId: string, user?: CurrentUserPayload) {
    this.assertCollegeAssignment(input.collegeId, user);
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
        collegeId: input.collegeId,
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
    collegeId?: string,
    user?: CurrentUserPayload,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

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

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      // Non-admins can only see PUBLISHED problems
      where.status = ProblemStatus.PUBLISHED;

      // Restrict college problems to user's colleges or public (null)
      const userCollegeIds = user?.memberships?.map((m) => m.collegeId) || [];
      if (collegeId) {
        if (!userCollegeIds.includes(collegeId)) {
          where.collegeId = '__unauthorized_college__';
        } else {
          where.collegeId = collegeId;
        }
      } else {
        const visibilityConditions = [
          { collegeId: null },
          ...(userCollegeIds.length > 0 ? [{ collegeId: { in: userCollegeIds } }] : []),
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
      if (collegeId) {
        where.collegeId = collegeId;
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
            where: { isHidden: false },
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

  async findByIdOrSlug(idOrSlug: string, user?: CurrentUserPayload) {
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

    const isSuperAdmin =
      user &&
      (user.globalRole === Role.SUPER_ADMIN ||
        user.globalRole === Role.PLATFORM_ADMIN);

    const isOwner = user && problem.createdById === user.id;
    const isCollegeStaff =
      user &&
      problem.collegeId &&
      user.memberships?.some(
        (m) =>
          m.collegeId === problem.collegeId &&
          (m.role === Role.FACULTY || m.role === Role.COLLEGE_ADMIN),
      );

    const hasPrivilegedAccess = isSuperAdmin || isOwner || isCollegeStaff;

    if (!hasPrivilegedAccess) {
      if (problem.status !== ProblemStatus.PUBLISHED) {
        throw new NotFoundException(`Problem ${idOrSlug} not found`);
      }
      if (problem.collegeId) {
        const isMember = user?.memberships?.some(
          (m) => m.collegeId === problem.collegeId,
        );
        if (!isMember) {
          throw new NotFoundException(`Problem ${idOrSlug} not found`);
        }
      }
    }

    const testCases = await this.prisma.testCase.findMany({
      where: {
        problemId: problem.id,
        ...(hasPrivilegedAccess ? {} : { isHidden: false }),
      },
      orderBy: { order: 'asc' },
    });

    return {
      ...problem,
      testCases,
    };
  }

  async update(id: string, input: UpdateProblemInput, user?: CurrentUserPayload) {
    const existing = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    this.assertProblemAuthorOrAdmin(existing, user);

    return this.prisma.problem.update({
      where: { id },
      data: input,
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

    return this.prisma.testCase.create({
      data: {
        problemId,
        input: input.input,
        expectedOutput: input.expectedOutput,
        isHidden: input.isHidden !== undefined ? input.isHidden : true,
        explanation: input.explanation,
        order: input.order ?? 0,
      },
    });
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
    const isCollegeStaff = Boolean(
      user &&
        problem.collegeId &&
        user.memberships?.some(
          (m) =>
            m.collegeId === problem.collegeId &&
            (m.role === Role.FACULTY || m.role === Role.COLLEGE_ADMIN),
        ),
    );

    const hasPrivilegedAccess = isSuperAdmin || isOwner || isCollegeStaff;

    if (!hasPrivilegedAccess) {
      if (problem.status !== ProblemStatus.PUBLISHED) {
        throw new NotFoundException(`Problem with ID ${problemId} not found`);
      }
      if (
        problem.collegeId &&
        !user?.memberships?.some((membership) => membership.collegeId === problem.collegeId)
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

  private assertProblemAuthorOrAdmin(problem: { createdById: string; collegeId: string | null }, user?: CurrentUserPayload) {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    if (problem.createdById === user.id) {
      return;
    }
    if (problem.collegeId) {
      const isCollegeAdmin = user.memberships?.some(
        (m) => m.collegeId === problem.collegeId && m.role === Role.COLLEGE_ADMIN,
      );
      if (isCollegeAdmin) {
        return;
      }
    }
    throw new ForbiddenException('You do not have permission to modify this problem');
  }

  private assertCollegeAssignment(collegeId: string | undefined, user?: CurrentUserPayload) {
    if (!collegeId) {
      return;
    }
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const canManageCollege = user.memberships?.some(
      (membership) =>
        membership.collegeId === collegeId &&
        (membership.role === Role.COLLEGE_ADMIN || membership.role === Role.FACULTY),
    );
    if (!canManageCollege) {
      throw new ForbiddenException('You can only create problems in your assigned college');
    }
  }
}
