import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContestStatus, Prisma, Role } from '@prisma/client';
import { AppCacheService } from '../common/cache/app-cache.service.js';
import { AppEvents, SubmissionEvaluatedEvent } from '../common/events/app-events.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { AddContestProblemInput } from './dto/add-contest-problem.input.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';

import { Subject, Observable, map, filter, interval, merge } from 'rxjs';

@Injectable()
export class ContestsService {
  private readonly contestEvents$ = new Subject<{ contestId: string; type: string; data: any }>();

  constructor(
    private prisma: PrismaService,
    @Optional() private cacheService?: AppCacheService,
  ) {}

  @OnEvent(AppEvents.SUBMISSION_EVALUATED)
  async handleSubmissionEvaluated(event: SubmissionEvaluatedEvent) {
    if (event.contestId) {
      if (this.cacheService) {
        try {
          await this.cacheService.invalidate(`leaderboard:contest:${event.contestId}`);
          await this.cacheService.invalidate(`leaderboard:${event.contestId}`);
          await this.cacheService.invalidatePrefix(`leaderboard:contest:${event.contestId}:`);
        } catch {
          // Cache invalidation failure must not block real-time contest broadcast
        }
      }
      this.broadcastContestUpdate(event.contestId, 'LEADERBOARD_UPDATE', {
        submissionId: event.submissionId,
        userId: event.userId,
        verdict: event.verdict,
      });
    }
  }

  public broadcastContestUpdate(contestId: string, type = 'LEADERBOARD_UPDATE', data: any = {}) {
    this.contestEvents$.next({ contestId, type, data: { ...data, timestamp: new Date().toISOString() } });
  }

  public getContestLiveStream(contestId: string): Observable<{ data: any }> {
    const liveEvents$ = this.contestEvents$.pipe(
      filter((event) => event.contestId === contestId),
      map((event) => ({ data: { type: event.type, payload: event.data } })),
    );

    // Heartbeat ping every 15s to keep connection alive
    const heartbeat$ = interval(15000).pipe(
      map(() => ({ data: { type: 'HEARTBEAT', payload: { contestId, time: new Date().toISOString() } } })),
    );

    return merge(liveEvents$, heartbeat$);
  }

  async create(input: CreateContestInput, creatorId: string, user?: CurrentUserPayload) {
    let institutionId = input.institutionId || input.collegeId;

    if (input.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: input.batchId },
        select: { id: true, institutionId: true },
      });
      if (!batch) {
        throw new NotFoundException(`Batch with ID ${input.batchId} not found`);
      }
      if (!institutionId) {
        institutionId = batch.institutionId;
      } else if (batch.institutionId !== institutionId) {
        throw new BadRequestException('Batch does not belong to the selected institution');
      }
    }

    this.assertInstitutionAssignment(institutionId, user);
    if (input.endTime <= input.startTime) {
      throw new BadRequestException('Contest end time must be after its start time');
    }

    if (input.problemIds && input.problemIds.length > 0) {
      const problems = await this.prisma.problem.findMany({
        where: { id: { in: input.problemIds } },
      });

      if (problems.length !== input.problemIds.length) {
        throw new NotFoundException('One or more problems not found');
      }

      for (const problem of problems) {
        if (problem.status !== 'PUBLISHED') {
          throw new ForbiddenException('Only published problems can be added to a contest');
        }

        if (problem.institutionId) {
          if (institutionId !== problem.institutionId) {
            throw new ForbiddenException('Institution problems can only be added to contests from the same institution');
          }

          const canAccessProblem =
            user?.globalRole === Role.SUPER_ADMIN ||
            user?.globalRole === Role.PLATFORM_ADMIN ||
            problem.createdById === user?.id ||
            user?.memberships?.some(
              (membership) =>
                membership.institutionId === problem.institutionId &&
                (membership.role === Role.FACULTY || membership.role === Role.INSTITUTION_ADMIN),
            );
          if (!canAccessProblem) {
            throw new ForbiddenException('You do not have access to this problem');
          }
        }
      }
    }

    const contest = await this.prisma.$transaction(async (tx) => {
      const created = await tx.contest.create({
        data: {
          title: input.title,
          slug: input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36),
          code: input.code,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          durationMinutes: input.durationMinutes ?? 90,
          isProctored: input.isProctored ?? false,
          enforceFullScreen: input.enforceFullScreen ?? true,
          tabSwitchLimit: input.tabSwitchLimit ?? 3,
          disableCopyPaste: input.disableCopyPaste ?? true,
          webcamProctoring: input.webcamProctoring ?? false,
          audioProctoring: input.audioProctoring ?? false,
          plagiarismCheck: input.plagiarismCheck ?? true,
          scoringFormat: input.scoringFormat ?? 'ICPC',
          windowType: input.windowType ?? 'FIXED',
          shuffleQuestions: input.shuffleQuestions ?? false,
          ipRestriction: input.ipRestriction,
          institutionId,
          batchId: input.batchId,
          createdById: creatorId,
          status: input.status || ContestStatus.UPCOMING,
        },
      });

      // Auto-link selected problems if provided
      if (input.problemIds && input.problemIds.length > 0) {
        await tx.contestProblem.createMany({
          data: input.problemIds.map((pid, idx) => ({
            contestId: created.id,
            problemId: pid,
            order: idx,
            points: 100,
          })),
          skipDuplicates: true,
        });
      }

      // Auto-register all students in the assigned batch
      if (input.batchId) {
        const batchStudents = await tx.batchStudent.findMany({
          where: { batchId: input.batchId },
          select: { userId: true },
        });

        if (batchStudents.length > 0) {
          await tx.contestRegistration.createMany({
            data: batchStudents.map((bs) => ({
              contestId: created.id,
              userId: bs.userId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return created;
    });

    return this.findById(contest.id, user);
  }

  async findPaginated(
    args: PaginationArgs,
    status?: ContestStatus,
    institutionId?: string,
    user?: CurrentUserPayload,
    batchId?: string,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const targetInstId = institutionId;
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

    if (batchId) {
      where.batchId = batchId;
    }

    const isSuperAdmin =
      user?.globalRole === Role.SUPER_ADMIN ||
      user?.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
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
      if (targetInstId) {
        where.institutionId = targetInstId;
      }
    }

    const orderBy: Prisma.ContestOrderByWithRelationInput = {};
    if (args.sortBy && ['title', 'status', 'startTime', 'endTime', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
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
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
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
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
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

    if (!isSuperAdmin && contest.institutionId) {
      const isMember = user?.memberships?.some(
        (m) => m.institutionId === contest.institutionId,
      );
      if (!isMember) {
        throw new NotFoundException(`Contest with ID ${id} not found`);
      }
    }

    // Registration rosters contain user profile data. They are an administrative
    // view, not a participant-facing contest detail.
    const canViewRegistrations =
      isSuperAdmin ||
      contest.createdById === user?.id ||
      Boolean(
        contest.institutionId &&
          user?.memberships?.some(
            (membership) =>
              membership.institutionId === contest.institutionId &&
              membership.role === Role.INSTITUTION_ADMIN,
          ),
      );
    if (!canViewRegistrations) {
      contest.registrations = [];
    }

    return contest;
  }

  async update(id: string, input: UpdateContestInput, user?: CurrentUserPayload) {
    const contest = await this.findById(id, user);
    this.assertContestAuthorOrAdmin(contest, user);

    const startTime = input.startTime || contest.startTime;
    const endTime = input.endTime || contest.endTime;
    if (endTime <= startTime) {
      throw new BadRequestException('Contest end time must be after its start time');
    }

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

    if (contest.institutionId && user) {
      const isMember = user.memberships?.some((m) => m.institutionId === contest.institutionId);
      if (!isMember && user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
        throw new ForbiddenException('You can only register for contests hosted by your institution');
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

    if (problem.status !== 'PUBLISHED') {
      throw new ForbiddenException('Only published problems can be added to a contest');
    }

    if (problem.institutionId) {
      if (contest.institutionId !== problem.institutionId) {
        throw new ForbiddenException('Institution problems can only be added to contests from the same institution');
      }

      const canAccessProblem =
        user?.globalRole === Role.SUPER_ADMIN ||
        user?.globalRole === Role.PLATFORM_ADMIN ||
        problem.createdById === user?.id ||
        user?.memberships?.some(
          (membership) =>
            membership.institutionId === problem.institutionId &&
            (membership.role === Role.FACULTY || membership.role === Role.INSTITUTION_ADMIN),
        );
      if (!canAccessProblem) {
        throw new ForbiddenException('You do not have access to this problem');
      }
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
    contest: { createdById: string; institutionId: string | null },
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
    if (contest.institutionId) {
      const isInstitutionAdmin = user.memberships?.some(
        (m) => m.institutionId === contest.institutionId && m.role === Role.INSTITUTION_ADMIN,
      );
      if (isInstitutionAdmin) {
        return;
      }
    }
    throw new ForbiddenException('You do not have permission to modify this contest');
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
      throw new ForbiddenException('You can only create contests in your assigned institution');
    }
  }
}
