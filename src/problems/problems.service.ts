import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(input: CreateProblemInput, creatorId: string) {
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

    if (status) {
      where.status = status;
    }

    if (collegeId) {
      where.collegeId = collegeId;
    }

    const orderBy: Prisma.ProblemOrderByWithRelationInput = {};
    if (args.sortBy) {
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
    const isSuperAdminOrAdmin =
      user &&
      (user.globalRole === Role.SUPER_ADMIN ||
        user.globalRole === Role.PLATFORM_ADMIN ||
        user.globalRole === Role.FACULTY);

    const problem = await this.prisma.problem.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        testCases: isSuperAdminOrAdmin
          ? true
          : {
              where: { isHidden: false },
            },
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

    return problem;
  }

  async update(id: string, input: UpdateProblemInput) {
    const existing = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

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

  async delete(id: string) {
    const existing = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    await this.prisma.problem.delete({
      where: { id },
    });

    return true;
  }

  async addTestCase(problemId: string, input: CreateTestCaseInput) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

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

  async getTestCases(problemId: string, isSuperAdmin: boolean = false) {
    return this.prisma.testCase.findMany({
      where: {
        problemId,
        ...(isSuperAdmin ? {} : { isHidden: false }),
      },
      orderBy: { order: 'asc' },
    });
  }
}
