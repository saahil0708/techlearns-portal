import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ComparativeLeaderboardService } from './comparative-leaderboard.service.js';

describe('ComparativeLeaderboardService', () => {
  let service: ComparativeLeaderboardService;
  let prisma: {
    institution: {
      findMany: ReturnType<typeof vi.fn>;
    };
    batch: {
      findMany: ReturnType<typeof vi.fn>;
    };
    contest: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      institution: {
        findMany: vi.fn(),
      },
      batch: {
        findMany: vi.fn(),
      },
      contest: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComparativeLeaderboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ComparativeLeaderboardService>(ComparativeLeaderboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate college leaderboard correctly', async () => {
    prisma.institution.findMany.mockResolvedValue([
      {
        id: 'inst-1',
        name: 'MIT',
        code: 'MIT',
        tier: 'Tier 1',
        memberships: [
          {
            user: {
              id: 'u-1',
              contestRating: 2200,
              submissions: [{ problemId: 'p-1', createdAt: new Date() }],
            },
          },
          {
            user: {
              id: 'u-2',
              contestRating: 1800,
              submissions: [{ problemId: 'p-2', createdAt: new Date() }],
            },
          },
        ],
      },
    ]);

    const result = await service.getCollegeLeaderboard();
    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
    expect(result[0].name).toBe('MIT');
    expect(result[0].totalStudents).toBe(2);
    expect(result[0].avgContestRating).toBe(2000);
    expect(result[0].topTierAvgRating).toBe(2200);
    expect(result[0].totalProblemsSolved).toBe(2);
  });

  it('should calculate batch leaderboard correctly', async () => {
    prisma.batch.findMany.mockResolvedValue([
      {
        id: 'b-1',
        name: 'Batch Alpha',
        institutionId: 'inst-1',
        maxCapacity: 60,
        students: [
          {
            user: {
              id: 'u-1',
              contestRating: 1900,
              submissions: [{ problemId: 'p-1', createdAt: new Date() }],
            },
          },
        ],
      },
    ]);

    const result = await service.getBatchLeaderboard('inst-1');
    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
    expect(result[0].name).toBe('Batch Alpha');
    expect(result[0].avgRating).toBe(1900);
    expect(result[0].solveRatioPerStudent).toBe(1.0);
  });
});
