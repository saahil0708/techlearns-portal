import { ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Role, SubmissionVerdict } from '@prisma/client';
import { AppCacheService } from '../common/cache/app-cache.service.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CollegeLeaderboardRow {
  rank: number;
  institutionId: string;
  name: string;
  code: string;
  tier: string;
  totalStudents: number;
  activeStudentsCount: number;
  avgContestRating: number;
  topTierAvgRating: number;
  totalProblemsSolved: number;
}

export interface BatchLeaderboardRow {
  rank: number;
  batchId: string;
  name: string;
  institutionId: string;
  enrolledCount: number;
  maxCapacity: number;
  avgRating: number;
  totalProblemsSolved: number;
  solveRatioPerStudent: number;
  activeSolversPercentage: number;
}

export interface ContestMatrixRow {
  rank: number;
  userId: string;
  name: string;
  email?: string;
  contestRating: number;
  totalScore: number;
  totalPenalty: number;
  problemScores: Record<string, { solved: boolean; attempts: number; score: number; solveTimeMinutes?: number }>;
}

@Injectable()
export class ComparativeLeaderboardService {
  constructor(
    private prisma: PrismaService,
    @Optional() private cacheService?: AppCacheService,
  ) {}

  /**
   * Global Inter-College Leaderboard ranking institutions by top student ratings and volume
   */
  async getCollegeLeaderboard(): Promise<CollegeLeaderboardRow[]> {
    if (this.cacheService) {
      return this.cacheService.getOrSet('leaderboard:college:global', 30, () =>
        this.computeCollegeLeaderboard(),
      );
    }
    return this.computeCollegeLeaderboard();
  }

  private async computeCollegeLeaderboard(): Promise<CollegeLeaderboardRow[]> {
    const institutions = await this.prisma.institution.findMany({
      where: { status: 'ACTIVE' },
      include: {
        memberships: {
          where: { role: Role.STUDENT },
          include: {
            user: {
              select: {
                id: true,
                contestRating: true,
                submissions: {
                  where: { verdict: SubmissionVerdict.ACCEPTED },
                  select: { problemId: true, createdAt: true },
                },
              },
            },
          },
        },
      },
    });

    const rows: Omit<CollegeLeaderboardRow, 'rank'>[] = institutions.map((inst) => {
      const students = inst.memberships.map((m) => m.user);
      const totalStudents = students.length;

      if (totalStudents === 0) {
        return {
          institutionId: inst.id,
          name: inst.name,
          code: inst.code,
          tier: inst.tier || 'Standard Academic',
          totalStudents: 0,
          activeStudentsCount: 0,
          avgContestRating: 1500,
          topTierAvgRating: 1500,
          totalProblemsSolved: 0,
        };
      }

      // Calculate Ratings
      const ratings = students.map((s) => s.contestRating).sort((a, b) => b - a);
      const avgRating = Math.round(ratings.reduce((acc, r) => acc + r, 0) / totalStudents);

      // Top 10% rating
      const topCount = Math.max(1, Math.ceil(totalStudents * 0.1));
      const topTierRatings = ratings.slice(0, topCount);
      const topTierAvgRating = Math.round(
        topTierRatings.reduce((acc, r) => acc + r, 0) / topTierRatings.length,
      );

      // Distinct Problems Solved and Active Solvers (in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let totalSolved = 0;
      let activeStudents = 0;

      for (const s of students) {
        const solvedProblemIds = new Set(s.submissions.map((sub) => sub.problemId));
        totalSolved += solvedProblemIds.size;
        const hasRecent = s.submissions.some((sub) => sub.createdAt >= thirtyDaysAgo);
        if (hasRecent) activeStudents += 1;
      }

      return {
        institutionId: inst.id,
        name: inst.name,
        code: inst.code,
        tier: inst.tier || 'Standard Academic',
        totalStudents,
        activeStudentsCount: activeStudents,
        avgContestRating: avgRating,
        topTierAvgRating,
        totalProblemsSolved: totalSolved,
      };
    });

    // Sort by topTierAvgRating desc, then totalProblemsSolved desc
    rows.sort((a, b) => {
      if (b.topTierAvgRating !== a.topTierAvgRating) {
        return b.topTierAvgRating - a.topTierAvgRating;
      }
      return b.totalProblemsSolved - a.totalProblemsSolved;
    });

    return rows.map((row, idx) => ({
      ...row,
      rank: idx + 1,
    }));
  }

  /**
   * Institution-scoped batch leaderboard ranking student cohorts within a college
   */
  async getBatchLeaderboard(
    institutionId: string,
    user?: CurrentUserPayload,
  ): Promise<BatchLeaderboardRow[]> {
    // Multi-tenant check
    if (user && user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const isMember = user.memberships?.some((m) => m.institutionId === institutionId);
      if (!isMember) {
        throw new ForbiddenException('You do not have permission to view this institution leaderboard');
      }
    }

    const batches = await this.prisma.batch.findMany({
      where: { institutionId, status: 'ACTIVE' },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                contestRating: true,
                submissions: {
                  where: { verdict: SubmissionVerdict.ACCEPTED },
                  select: { problemId: true, createdAt: true },
                },
              },
            },
          },
        },
      },
    });

    const rows: Omit<BatchLeaderboardRow, 'rank'>[] = batches.map((batch) => {
      const students = batch.students.map((bs) => bs.user);
      const enrolledCount = students.length;

      if (enrolledCount === 0) {
        return {
          batchId: batch.id,
          name: batch.name,
          institutionId: batch.institutionId,
          enrolledCount: 0,
          maxCapacity: batch.maxCapacity,
          avgRating: 1500,
          totalProblemsSolved: 0,
          solveRatioPerStudent: 0,
          activeSolversPercentage: 0,
        };
      }

      const totalRating = students.reduce((acc, s) => acc + s.contestRating, 0);
      const avgRating = Math.round(totalRating / enrolledCount);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let totalSolved = 0;
      let activeCount = 0;

      for (const s of students) {
        const solvedProblemIds = new Set(s.submissions.map((sub) => sub.problemId));
        totalSolved += solvedProblemIds.size;
        if (s.submissions.some((sub) => sub.createdAt >= thirtyDaysAgo)) {
          activeCount += 1;
        }
      }

      const solveRatioPerStudent = Number((totalSolved / enrolledCount).toFixed(1));
      const activeSolversPercentage = Number(((activeCount / enrolledCount) * 100).toFixed(1));

      return {
        batchId: batch.id,
        name: batch.name,
        institutionId: batch.institutionId,
        enrolledCount,
        maxCapacity: batch.maxCapacity,
        avgRating,
        totalProblemsSolved: totalSolved,
        solveRatioPerStudent,
        activeSolversPercentage,
      };
    });

    // Sort by avgRating desc, then totalProblemsSolved desc
    rows.sort((a, b) => {
      if (b.avgRating !== a.avgRating) {
        return b.avgRating - a.avgRating;
      }
      return b.totalProblemsSolved - a.totalProblemsSolved;
    });

    return rows.map((row, idx) => ({
      ...row,
      rank: idx + 1,
    }));
  }

  /**
   * START256 Matrix Contest Leaderboard ranking participants with per-problem solve breakdowns
   */
  async getContestMatrixLeaderboard(
    contestId: string,
    user?: CurrentUserPayload,
  ): Promise<ContestMatrixRow[]> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        problems: {
          select: {
            problemId: true,
            order: true,
            points: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                contestRating: true,
              },
            },
          },
        },
        submissions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest ${contestId} not found`);
    }

    const hasAdminRole =
      user &&
      (user.globalRole === Role.SUPER_ADMIN ||
        user.globalRole === Role.PLATFORM_ADMIN ||
        user.globalRole === Role.INSTITUTION_ADMIN ||
        user.globalRole === Role.FACULTY ||
        (user as any).role === Role.SUPER_ADMIN ||
        (user as any).role === Role.PLATFORM_ADMIN ||
        (user as any).role === Role.INSTITUTION_ADMIN ||
        (user as any).role === Role.FACULTY);

    const participantMap = new Map<string, ContestMatrixRow>();

    for (const reg of contest.registrations) {
      participantMap.set(reg.userId, {
        rank: 0,
        userId: reg.userId,
        name: reg.user.name,
        email: hasAdminRole ? reg.user.email : undefined,
        contestRating: reg.user.contestRating,
        totalScore: 0,
        totalPenalty: 0,
        problemScores: {},
      });
    }

    // Process submissions
    for (const sub of contest.submissions) {
      let row = participantMap.get(sub.userId);
      if (!row) continue;

      if (!row.problemScores[sub.problemId]) {
        row.problemScores[sub.problemId] = {
          solved: false,
          attempts: 0,
          score: 0,
        };
      }

      const probScore = row.problemScores[sub.problemId];
      if (probScore.solved) continue; // Already solved

      probScore.attempts += 1;
      if (sub.verdict === SubmissionVerdict.ACCEPTED) {
        probScore.solved = true;
        const contestProblem = contest.problems.find((p) => p.problemId === sub.problemId);
        const pts = contestProblem?.points ?? 100;
        probScore.score = pts;
        const diffMinutes = Math.max(
          0,
          Math.floor((sub.createdAt.getTime() - contest.startTime.getTime()) / (1000 * 60)),
        );
        probScore.solveTimeMinutes = diffMinutes;
        row.totalScore += pts;
        row.totalPenalty += diffMinutes + (probScore.attempts - 1) * 20; // 20 min per WA
      }
    }

    const rows = Array.from(participantMap.values());
    rows.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.totalPenalty - b.totalPenalty;
    });

    return rows.map((r, idx) => ({
      ...r,
      rank: idx + 1,
    }));
  }
}
