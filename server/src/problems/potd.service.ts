import { Injectable, Logger } from '@nestjs/common';
import { ProblemStatus, SubmissionVerdict } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PotdResponse {
  date: string; // ISO date 'YYYY-MM-DD'
  problem: any;
  bonusPoints: number;
  isSolved: boolean;
  userStreak?: {
    currentStreak: number;
    maxStreak: number;
    streakMultiplier: number;
    streakActiveToday: boolean;
    freezeCount: number;
  };
}

export interface StreakDetailResponse {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  streakMultiplier: number;
  streakActiveToday: boolean;
  freezeCount: number;
  totalActiveDays: number;
  lastSolvedDate: string | null;
  activityHistory: { date: string; count: number }[];
}

@Injectable()
export class PotdService {
  private readonly logger = new Logger(PotdService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Returns 'YYYY-MM-DD' formatted string for a date (UTC)
   */
  public getIsoDate(date = new Date()): string {
    return date.toISOString().slice(0, 10);
  }

  /**
   * Deterministically hash a date string into an integer index
   */
  private hashDateToIndex(dateStr: string, modulus: number): number {
    if (modulus <= 0) return 0;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % modulus;
  }

  /**
   * Get the Problem of the Day for a given date (defaults to today)
   */
  async getPotd(dateStr = this.getIsoDate(), userId?: string): Promise<PotdResponse | null> {
    const publishedProblems = await this.prisma.problem.findMany({
      where: {
        status: ProblemStatus.PUBLISHED,
        institutionId: null, // Global platform problems
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        statement: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
    });

    if (publishedProblems.length === 0) {
      return null;
    }

    const selectedIndex = this.hashDateToIndex(dateStr, publishedProblems.length);
    const problem = publishedProblems[selectedIndex];

    let isSolved = false;
    let userStreakInfo;

    if (userId) {
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const acceptedSubmission = await this.prisma.submission.findFirst({
        where: {
          userId,
          problemId: problem.id,
          verdict: SubmissionVerdict.ACCEPTED,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      isSolved = !acceptedSubmission ? false : true;
      const streakData = await this.getUserStreak(userId);
      userStreakInfo = {
        currentStreak: streakData.currentStreak,
        maxStreak: streakData.maxStreak,
        streakMultiplier: streakData.streakMultiplier,
        streakActiveToday: streakData.streakActiveToday,
        freezeCount: streakData.freezeCount,
      };
    }

    const bonusPoints = 50 + (userStreakInfo?.currentStreak ? Math.min(userStreakInfo.currentStreak * 5, 100) : 0);

    return {
      date: dateStr,
      problem,
      bonusPoints,
      isSolved,
      userStreak: userStreakInfo,
    };
  }

  /**
   * Get past N days of POTDs
   */
  async getPotdHistory(days = 14, userId?: string): Promise<PotdResponse[]> {
    const publishedProblems = await this.prisma.problem.findMany({
      where: {
        status: ProblemStatus.PUBLISHED,
        institutionId: null, // Global platform problems
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        statement: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
    });

    if (publishedProblems.length === 0) {
      return [];
    }

    const today = new Date();
    const historyStartDate = new Date(today);
    historyStartDate.setDate(historyStartDate.getDate() - days);
    historyStartDate.setUTCHours(0, 0, 0, 0);

    let userStreakInfo;
    let userAcceptedSubmissions: Array<{ problemId: string; createdAt: Date }> = [];

    if (userId) {
      const streakData = await this.getUserStreak(userId);
      userStreakInfo = {
        currentStreak: streakData.currentStreak,
        maxStreak: streakData.maxStreak,
        streakMultiplier: streakData.streakMultiplier,
        streakActiveToday: streakData.streakActiveToday,
        freezeCount: streakData.freezeCount,
      };

      userAcceptedSubmissions = await this.prisma.submission.findMany({
        where: {
          userId,
          verdict: SubmissionVerdict.ACCEPTED,
          createdAt: {
            gte: historyStartDate,
          },
        },
        select: {
          problemId: true,
          createdAt: true,
        },
      });
    }

    const results: PotdResponse[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = this.getIsoDate(d);
      const selectedIndex = this.hashDateToIndex(iso, publishedProblems.length);
      const problem = publishedProblems[selectedIndex];

      let isSolved = false;
      if (userId) {
        const dayStart = new Date(`${iso}T00:00:00.000Z`);
        const dayEnd = new Date(`${iso}T23:59:59.999Z`);
        isSolved = userAcceptedSubmissions.some(
          (s) => s.problemId === problem.id && s.createdAt >= dayStart && s.createdAt <= dayEnd,
        );
      }

      const bonusPoints = 50 + (userStreakInfo?.currentStreak ? Math.min(userStreakInfo.currentStreak * 5, 100) : 0);

      results.push({
        date: iso,
        problem,
        bonusPoints,
        isSolved,
        userStreak: userStreakInfo,
      });
    }

    return results;
  }

  /**
   * Calculate detailed streak and submission history for a user
   */
  async getUserStreak(userId: string): Promise<StreakDetailResponse> {
    const acceptedSubmissions = await this.prisma.submission.findMany({
      where: {
        userId,
        verdict: SubmissionVerdict.ACCEPTED,
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const solveDateMap = new Map<string, number>();
    for (const sub of acceptedSubmissions) {
      const day = this.getIsoDate(sub.createdAt);
      solveDateMap.set(day, (solveDateMap.get(day) || 0) + 1);
    }

    const uniqueDates = Array.from(solveDateMap.keys()).sort();
    const todayStr = this.getIsoDate();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = this.getIsoDate(yesterdayDate);

    const streakActiveToday = solveDateMap.has(todayStr);

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of uniqueDates) {
      const curr = new Date(`${dStr}T00:00:00.000Z`);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffMs = curr.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      prevDate = curr;
    }

    if (uniqueDates.length > 0) {
      const hasToday = solveDateMap.has(todayStr);
      const hasYesterday = solveDateMap.has(yesterdayStr);

      if (hasToday || hasYesterday) {
        let checkDate = new Date(hasToday ? todayStr : yesterdayStr);
        currentStreak = 0;
        while (true) {
          const checkStr = this.getIsoDate(checkDate);
          if (solveDateMap.has(checkStr)) {
            currentStreak += 1;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const streakMultiplier = Number((1.0 + Math.min(currentStreak, 30) * 0.02).toFixed(2));

    const activityHistory = Array.from(solveDateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const lastSolvedDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;

    return {
      userId,
      currentStreak,
      maxStreak,
      streakMultiplier,
      streakActiveToday,
      freezeCount: 2,
      totalActiveDays: uniqueDates.length,
      lastSolvedDate,
      activityHistory,
    };
  }
}
