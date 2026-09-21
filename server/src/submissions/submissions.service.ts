import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import {
  ContestStatus,
  Prisma,
  ProgrammingLanguage,
  SubmissionStatus,
  SubmissionVerdict,
} from '@prisma/client';
import { Queue } from 'bullmq';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import {
  EVALUATE_SUBMISSION_JOB,
  EvaluateSubmissionJobData,
  JUDGE_QUEUE_NAME,
} from '../judge/judge.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { CreateSubmissionInput } from './dto/create-submission.input.js';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private prisma: PrismaService,
    @Optional()
    @InjectQueue(JUDGE_QUEUE_NAME)
    private submissionQueue?: Queue<EvaluateSubmissionJobData>,
  ) {}

  async create(input: CreateSubmissionInput, userId: string, user?: CurrentUserPayload) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: input.problemId },
      include: {
        testCases: true,
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${input.problemId} not found`);
    }

    const isAuthorOrAdmin =
      user?.id === problem.createdById ||
      user?.globalRole === 'SUPER_ADMIN' ||
      user?.globalRole === 'PLATFORM_ADMIN';

    if (problem.status && problem.status !== 'PUBLISHED' && !isAuthorOrAdmin) {
      throw new ForbiddenException('You cannot submit to an unpublished problem');
    }

    if (problem.institutionId) {
      const canAccessInstitution = user?.globalRole === 'SUPER_ADMIN' ||
        user?.globalRole === 'PLATFORM_ADMIN' ||
        user?.memberships?.some((membership) => membership.institutionId === problem.institutionId);
      if (!canAccessInstitution) {
        throw new ForbiddenException('You do not have access to this problem');
      }
    }

    if (input.contestId) {
      const contest = await this.prisma.contest.findUnique({
        where: { id: input.contestId },
        include: { problems: { where: { problemId: input.problemId } } },
      });
      if (!contest || contest.problems.length === 0) {
        throw new ForbiddenException('This problem is not part of the selected contest');
      }
      if (contest.status !== ContestStatus.ONGOING) {
        throw new ForbiddenException('Submissions are accepted only during an ongoing contest');
      }
      if (contest.institutionId && !user?.memberships?.some((membership) => membership.institutionId === contest.institutionId) && user?.globalRole !== 'SUPER_ADMIN' && user?.globalRole !== 'PLATFORM_ADMIN') {
        throw new ForbiddenException('You do not have access to this contest');
      }
      const registration = await this.prisma.contestRegistration.findUnique({
        where: { contestId_userId: { contestId: input.contestId, userId } },
      });
      if (!registration) {
        throw new ForbiddenException('You must register for the contest before submitting');
      }
    }

    const totalTestCases = problem.testCases.length;

    // Create submission in QUEUED status
    const submission = await this.prisma.submission.create({
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

    // Enqueue to BullMQ worker for evaluation
    if (this.submissionQueue) {
      try {
        await this.submissionQueue.add(EVALUATE_SUBMISSION_JOB, {
          submissionId: submission.id,
        });
      } catch (err: any) {
        this.logger.warn(
          `Failed to enqueue submission ${submission.id} to BullMQ: ${err.message}`,
        );
        return this.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: SubmissionStatus.FAILED,
            verdict: SubmissionVerdict.SYSTEM_ERROR,
            errorMessage: `Failed to enqueue submission for evaluation: ${err.message}`,
          },
          include: {
            user: {
              select: userSanitizedSelect,
            },
            problem: true,
          },
        });
      }
    } else {
      this.logger.warn(
        `Submission queue is unavailable for submission ${submission.id}`,
      );
      return this.prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.FAILED,
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          errorMessage: 'Judge submission queue is unavailable',
        },
        include: {
          user: {
            select: userSanitizedSelect,
          },
          problem: true,
        },
      });
    }

    return submission;
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
    const boundedLimit = Math.min(Math.max(Math.trunc(limit) || 20, 1), 100);
    return this.prisma.submission.findMany({
      take: boundedLimit,
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
