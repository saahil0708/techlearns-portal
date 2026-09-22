import { Test, TestingModule } from '@nestjs/testing';
import { ProblemStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PotdService } from './potd.service.js';

describe('PotdService', () => {
  let service: PotdService;
  let prisma: {
    problem: {
      findMany: ReturnType<typeof vi.fn>;
    };
    submission: {
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      problem: {
        findMany: vi.fn(),
      },
      submission: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PotdService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PotdService>(PotdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return deterministic POTD based on date', async () => {
    const mockProblems = [
      { id: 'p-1', title: 'Problem 1', slug: 'problem-1', status: ProblemStatus.PUBLISHED },
      { id: 'p-2', title: 'Problem 2', slug: 'problem-2', status: ProblemStatus.PUBLISHED },
    ];
    prisma.problem.findMany.mockResolvedValue(mockProblems);

    const potd1 = await service.getPotd('2026-09-20');
    const potd2 = await service.getPotd('2026-09-20');

    expect(potd1).toBeDefined();
    expect(potd1?.date).toBe('2026-09-20');
    expect(potd1?.problem.id).toEqual(potd2?.problem.id);
  });

  it('should calculate consecutive streak accurately', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    prisma.submission.findMany.mockResolvedValue([
      { createdAt: dayBefore },
      { createdAt: yesterday },
      { createdAt: today },
    ]);

    const streak = await service.getUserStreak('user-123');
    expect(streak.currentStreak).toBe(3);
    expect(streak.maxStreak).toBe(3);
    expect(streak.streakActiveToday).toBe(true);
    expect(streak.streakMultiplier).toBeGreaterThan(1.0);
  });

  it('should reject setPotd when problem is not published or has institutionId', async () => {
    (prisma.problem as any).findUnique = vi.fn().mockResolvedValue({
      id: 'p-draft',
      title: 'Draft Problem',
      status: ProblemStatus.DRAFT,
      institutionId: null,
    });

    await expect(service.setPotd('p-draft', '2026-09-22', 50)).rejects.toThrow(
      'Only published global platform problems can be set as Problem of the Day',
    );

    (prisma.problem as any).findUnique = vi.fn().mockResolvedValue({
      id: 'p-inst',
      title: 'College Problem',
      status: ProblemStatus.PUBLISHED,
      institutionId: 'inst-123',
    });

    await expect(service.setPotd('p-inst', '2026-09-22', 50)).rejects.toThrow(
      'Only published global platform problems can be set as Problem of the Day',
    );
  });

  it('should successfully set POTD for a published global problem', async () => {
    (prisma.problem as any).findUnique = vi.fn().mockResolvedValue({
      id: 'p-valid',
      title: 'Valid Global Problem',
      status: ProblemStatus.PUBLISHED,
      institutionId: null,
    });

    const result = await service.setPotd('p-valid', '2026-09-22', 75);
    expect(result.success).toBe(true);
    expect(result.date).toBe('2026-09-22');
    expect(result.bonusPoints).toBe(75);
  });
});
