import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  ProgrammingLanguage,
  SubmissionStatus,
  SubmissionVerdict,
} from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { CreateSubmissionInput } from './dto/create-submission.input.js';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateSubmissionInput, userId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: input.problemId },
      include: {
        testCases: true,
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${input.problemId} not found`);
    }

    const totalTestCases = problem.testCases.length;

    // Create submission in QUEUED status
    return this.prisma.submission.create({
      data: {
        userId,
        problemId: input.problemId,
        contestId: input.contestId,
        language: input.language,
        sourceCode: input.sourceCode,
        status: SubmissionStatus.QUEUED,
        totalTestCases,
        passedTestCases: 0,
      },
      include: {
        user: {
          select: userSanitizedSelect,
        },
        problem: true,
      },
    });
  }

  async findPaginated(
    args: PaginationArgs,
    problemId?: string,
    userId?: string,
    contestId?: string,
    verdict?: SubmissionVerdict,
    language?: ProgrammingLanguage,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SubmissionWhereInput = {};

    if (problemId) {
      where.problemId = problemId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (contestId) {
      where.contestId = contestId;
    }

    if (verdict) {
      where.verdict = verdict;
    }

    if (language) {
      where.language = language;
    }

    const orderBy: Prisma.SubmissionOrderByWithRelationInput = {};
    if (args.sortBy) {
      orderBy[args.sortBy as keyof Prisma.SubmissionOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: userSanitizedSelect,
          },
          problem: true,
        },
      }),
      this.prisma.submission.count({ where }),
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

  async findById(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: userSanitizedSelect,
        },
        problem: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }

  async getLiveFeed(limit: number = 20) {
    return this.prisma.submission.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: userSanitizedSelect,
        },
        problem: true,
      },
    });
  }
}
