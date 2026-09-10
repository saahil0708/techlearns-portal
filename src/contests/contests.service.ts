import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContestStatus, Prisma, Role } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { AddContestProblemInput } from './dto/add-contest-problem.input.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';

@Injectable()
export class ContestsService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateContestInput, creatorId: string, user?: CurrentUserPayload) {
    this.assertCollegeAssignment(input.collegeId, user);
    if (input.endTime <= input.startTime) {
      throw new BadRequestException('Contest end time must be after its start time');
    }
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
    user?: CurrentUserPayload,
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

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
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
      if (collegeId) {
        where.collegeId = collegeId;
      }
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

  async findById(id: string, user?: CurrentUserPayload) {
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

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin && contest.collegeId) {
      const isMember = user?.memberships?.some(
        (m) => m.collegeId === contest.collegeId,
      );
      if (!isMember) {
        throw new NotFoundException(`Contest with ID ${id} not found`);
      }
    }

    return contest;
  }

  async update(id: string, input: UpdateContestInput, user?: CurrentUserPayload) {
    const contest = await this.findById(id, user);
    this.assertContestAuthorOrAdmin(contest, user);

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

  async delete(id: string, user?: CurrentUserPayload) {
    const contest = await this.findById(id, user);
    this.assertContestAuthorOrAdmin(contest, user);

    await this.prisma.contest.delete({
      where: { id },
    });

    return true;
  }

  async registerUser(contestId: string, userId: string, user?: CurrentUserPayload) {
    const contest = await this.findById(contestId, user);
    const now = new Date();
    if (
      contest.status !== ContestStatus.UPCOMING &&
      contest.status !== ContestStatus.ONGOING
    ) {
      throw new ForbiddenException('Registration is closed for this contest');
    }
    if (now > contest.endTime) {
      throw new ForbiddenException('Registration is outside the contest time window');
    }

    if (contest.collegeId && user) {
      const isMember = user.memberships?.some((m) => m.collegeId === contest.collegeId);
      if (!isMember && user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
        throw new ForbiddenException('You can only register for contests hosted by your college');
      }
    }

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

  async addProblem(contestId: string, input: AddContestProblemInput, user?: CurrentUserPayload) {
    const contest = await this.findById(contestId, user);
    this.assertContestAuthorOrAdmin(contest, user);

    const problem = await this.prisma.problem.findUnique({
      where: { id: input.problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${input.problemId} not found`);
    }

    if (contest.collegeId && problem.collegeId && contest.collegeId !== problem.collegeId) {
      throw new ForbiddenException('Contest and problem must belong to the same college');
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

  private assertContestAuthorOrAdmin(
    contest: { createdById: string; collegeId: string | null },
    user?: CurrentUserPayload,
  ) {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    if (contest.createdById === user.id) {
      return;
    }
    if (contest.collegeId) {
      const isCollegeAdmin = user.memberships?.some(
        (m) => m.collegeId === contest.collegeId && m.role === Role.COLLEGE_ADMIN,
      );
      if (isCollegeAdmin) {
        return;
      }
    }
    throw new ForbiddenException('You do not have permission to modify this contest');
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
      throw new ForbiddenException('You can only create contests in your assigned college');
    }
  }
}
