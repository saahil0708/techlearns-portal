import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContestStatus, Prisma } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { AddContestProblemInput } from './dto/add-contest-problem.input.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';

@Injectable()
export class ContestsService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateContestInput, creatorId: string) {
    return this.prisma.contest.create({
      data: {
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        collegeId: input.collegeId,
        createdById: creatorId,
        status: input.status || ContestStatus.UPCOMING,
      },
      include: {
        _count: {
          select: {
            problems: true,
            registrations: true,
            submissions: true,
          },
        },
      },
    });
  }

  async findPaginated(
    args: PaginationArgs,
    status?: ContestStatus,
    collegeId?: string,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ContestWhereInput = {};

    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (collegeId) {
      where.collegeId = collegeId;
    }

    const orderBy: Prisma.ContestOrderByWithRelationInput = {};
    if (args.sortBy) {
      orderBy[args.sortBy as keyof Prisma.ContestOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.startTime = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.contest.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          problems: {
            include: {
              problem: true,
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              problems: true,
              registrations: true,
              submissions: true,
            },
          },
        },
      }),
      this.prisma.contest.count({ where }),
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
    const contest = await this.prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          include: {
            problem: true,
          },
          orderBy: { order: 'asc' },
        },
        registrations: {
          include: {
            user: {
              select: userSanitizedSelect,
            },
          },
        },
        _count: {
          select: {
            problems: true,
            registrations: true,
            submissions: true,
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }

    return contest;
  }

  async update(id: string, input: UpdateContestInput) {
    await this.findById(id);

    return this.prisma.contest.update({
      where: { id },
      data: input,
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
        _count: {
          select: {
            problems: true,
            registrations: true,
            submissions: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.contest.delete({
      where: { id },
    });

    return true;
  }

  async registerUser(contestId: string, userId: string) {
    await this.findById(contestId);

    const existing = await this.prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already registered for this contest');
    }

    return this.prisma.contestRegistration.create({
      data: {
        contestId,
        userId,
      },
      include: {
        user: {
          select: userSanitizedSelect,
        },
      },
    });
  }

  async addProblem(contestId: string, input: AddContestProblemInput) {
    await this.findById(contestId);

    const problem = await this.prisma.problem.findUnique({
      where: { id: input.problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${input.problemId} not found`);
    }

    return this.prisma.contestProblem.upsert({
      where: {
        contestId_problemId: {
          contestId,
          problemId: input.problemId,
        },
      },
      update: {
        points: input.points ?? 100,
        order: input.order ?? 0,
      },
      create: {
        contestId,
        problemId: input.problemId,
        points: input.points ?? 100,
        order: input.order ?? 0,
      },
      include: {
        problem: true,
      },
    });
  }
}
