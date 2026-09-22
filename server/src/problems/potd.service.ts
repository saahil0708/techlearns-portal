import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProblemStatus, SubmissionVerdict } from '@prisma/client';
import { Redis } from 'ioredis';
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
  private redis: Redis | null = null;
  private readonly memoryFallbackMap = new Map<string, { problemId: string; bonusPoints?: number }>();

  constructor(
    private prisma: PrismaService,
    @Optional() private configService?: ConfigService,
  ) {
    if (this.configService) {
      try {
        const host = this.configService.get<string>('redis.host', 'localhost');
        const port = this.configService.get<number>('redis.port', 6379);
        const password = this.configService.get<string>('redis.password');
        this.redis = new Redis({
          host,
          port,
          password: password || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
        this.redis.connect().catch((err) => {
          this.logger.warn(`Redis connection for POTD persistence not available: ${err.message}`);
        });
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Redis client for POTD: ${err.message}`);
      }
    }
  }

  /**
   * Helper to retrieve stored assignment from database (problemOfTheDay), Redis cache, or memory fallback
   */
  private async getStoredAssignment(dateStr: string): Promise<{ problemId: string; bonusPoints?: number } | null> {
    if ((this.prisma as any).problemOfTheDay) {
      try {
        const dbEntry = await (this.prisma as any).problemOfTheDay.findUnique({
          where: { date: dateStr },
        });
        if (dbEntry) {
          return { problemId: dbEntry.problemId, bonusPoints: dbEntry.bonusPoints };
        }
      } catch (err: any) {
        this.logger.warn(`Failed to read POTD from database for ${dateStr}: ${err.message}`);
      }
    }

    if (this.redis) {
      try {
        const raw = await this.redis.hget('potd:assignments', dateStr);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to read POTD from Redis for ${dateStr}: ${err.message}`);
      }
    }

    return this.memoryFallbackMap.get(dateStr) || null;
  }

  /**
   * Helper to retrieve all stored assignments across date keys, ensuring database records take precedence
   */
  private async getAllStoredAssignments(): Promise<Map<string, { problemId: string; bonusPoints?: number }>> {
    const map = new Map<string, { problemId: string; bonusPoints?: number }>(this.memoryFallbackMap);
    if (this.redis) {
      try {
        const all = await this.redis.hgetall('potd:assignments');
        if (all) {
          for (const [dateStr, raw] of Object.entries(all)) {
            try {
              map.set(dateStr, JSON.parse(raw));
            } catch {}
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to read all POTDs from Redis: ${err.message}`);
      }
    }

    if ((this.prisma as any).problemOfTheDay) {
      try {
        const dbEntries = await (this.prisma as any).problemOfTheDay.findMany();
        if (dbEntries && dbEntries.length > 0) {
          for (const entry of dbEntries) {
            map.set(entry.date, { problemId: entry.problemId, bonusPoints: entry.bonusPoints });
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to read all POTDs from database: ${err.message}`);
      }
    }

    return map;
  }

  /**
   * Set / schedule Problem of the Day for a specific date
   * Persists through database (problemOfTheDay.upsert) first, propagating failures,
   * then updates non-fatal Redis and local caches.
   */
  async setPotd(
    problemId: string,
    dateStr = this.getIsoDate(),
    bonusPoints = 50,
    user?: any,
  ) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        status: true,
        institutionId: true,
      },
    });

    if (!problem) {
      throw new Error(`Problem with ID "${problemId}" not found`);
    }

    if (problem.status !== ProblemStatus.PUBLISHED || problem.institutionId !== null) {
      throw new Error(`Only published global platform problems can be set as Problem of the Day`);
    }

    // Persist assignments through prisma.problemOfTheDay.upsert using unique date key before updating caches
    // Propagate database failures so request does not report success
    if ((this.prisma as any).problemOfTheDay) {
      await (this.prisma as any).problemOfTheDay.upsert({
        where: { date: dateStr },
        create: {
          date: dateStr,
          problemId,
          bonusPoints,
        },
        update: {
          problemId,
          bonusPoints,
        },
      });
    }

    // Update process-local and Redis caches (non-fatal)
    this.memoryFallbackMap.set(dateStr, { problemId, bonusPoints });

    if (this.redis) {
      try {
        const payload = JSON.stringify({ problemId, bonusPoints, setAt: new Date().toISOString() });
        await this.redis.hset('potd:assignments', dateStr, payload);
      } catch (err: any) {
        this.logger.warn(`Failed to update POTD Redis cache: ${err.message}`);
      }
    }

    this.logger.log(`POTD configured for ${dateStr}: "${problem.title}" (${problem.id}) by user ${user?.id || 'admin'}`);

    return {
      success: true,
      date: dateStr,
      problem,
      bonusPoints,
    };
  }

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
    let problem: any = null;
    let baseBonus = 50;

    const customEntry = await this.getStoredAssignment(dateStr);
    if (customEntry) {
      problem = await this.prisma.problem.findUnique({
        where: { id: customEntry.problemId },
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
      if (customEntry.bonusPoints) {
        baseBonus = customEntry.bonusPoints;
      }
    }

    if (!problem) {
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
      problem = publishedProblems[selectedIndex];
    }

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

    const bonusPoints = baseBonus + (userStreakInfo?.currentStreak ? Math.min(userStreakInfo.currentStreak * 5, 100) : 0);

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

    const allCustom = await this.getAllStoredAssignments();
    const results: PotdResponse[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = this.getIsoDate(d);
      
      let problem = publishedProblems[this.hashDateToIndex(iso, publishedProblems.length)];
      let baseBonus = 50;
      const custom = allCustom.get(iso);
      if (custom) {
        const found = publishedProblems.find((p) => p.id === custom.problemId);
        if (found) {
          problem = found;
          if (custom.bonusPoints) baseBonus = custom.bonusPoints;
        }
      }

      let isSolved = false;
      if (userId && problem) {
        const dayStart = new Date(`${iso}T00:00:00.000Z`);
        const dayEnd = new Date(`${iso}T23:59:59.999Z`);
        isSolved = userAcceptedSubmissions.some(
          (s) => s.problemId === problem.id && s.createdAt >= dayStart && s.createdAt <= dayEnd,
        );
      }

      const bonusPoints = baseBonus + (userStreakInfo?.currentStreak ? Math.min(userStreakInfo.currentStreak * 5, 100) : 0);

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

    if (acceptedSubmissions.length === 0) {
      return {
        userId,
        currentStreak: 0,
        maxStreak: 0,
        streakMultiplier: 1.0,
        streakActiveToday: false,
        freezeCount: 0,
        totalActiveDays: 0,
        lastSolvedDate: null,
        activityHistory: [],
      };
    }

    // Map submissions into distinct UTC date strings and count per day
    const dateCountMap = new Map<string, number>();
    for (const sub of acceptedSubmissions) {
      const dateKey = this.getIsoDate(sub.createdAt);
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + 1);
    }

    const uniqueSortedDates = Array.from(dateCountMap.keys()).sort();
    const totalActiveDays = uniqueSortedDates.length;
    const lastSolvedDate = uniqueSortedDates[uniqueSortedDates.length - 1];

    const todayStr = this.getIsoDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.getIsoDate(yesterday);

    const streakActiveToday = dateCountMap.has(todayStr);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    // If not solved today, check if active up to yesterday
    if (!streakActiveToday) {
      if (dateCountMap.has(yesterdayStr)) {
        checkDate = yesterday;
      } else {
        checkDate = null as any;
      }
    }

    if (checkDate) {
      const tempDate = new Date(checkDate);
      while (true) {
        const iso = this.getIsoDate(tempDate);
        if (dateCountMap.has(iso)) {
          currentStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate max streak across all historical dates
    let maxStreak = 0;
    let runningStreak = 0;
    let prevDateTime: number | null = null;

    for (const dateStr of uniqueSortedDates) {
      const currentDateTime = new Date(`${dateStr}T00:00:00.000Z`).getTime();
      if (prevDateTime === null) {
        runningStreak = 1;
      } else {
        const diffDays = Math.round((currentDateTime - prevDateTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      }
      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
      prevDateTime = currentDateTime;
    }

    // Calculate streak multiplier (1.0x baseline, up to 2.5x max at 30 days)
    const streakMultiplier = Math.min(1.0 + currentStreak * 0.05, 2.5);

    // Format activity history for last 60 days
    const activityHistory: { date: string; count: number }[] = [];
    const historyStart = new Date();
    historyStart.setDate(historyStart.getDate() - 60);

    for (let i = 0; i <= 60; i++) {
      const d = new Date(historyStart);
      d.setDate(d.getDate() + i);
      const iso = this.getIsoDate(d);
      activityHistory.push({
        date: iso,
        count: dateCountMap.get(iso) || 0,
      });
    }

    return {
      userId,
      currentStreak,
      maxStreak,
      streakMultiplier: parseFloat(streakMultiplier.toFixed(2)),
      streakActiveToday,
      freezeCount: 0,
      totalActiveDays,
      lastSolvedDate,
      activityHistory,
    };
  }
}
