import { NotFoundException } from '@nestjs/common';
import { ContestStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContestsService } from './contests.service.js';

describe('ContestsService', () => {
  let service: ContestsService;
  let prisma: PrismaService;

  const mockContest = {
    id: 'contest-1',
    title: 'Biweekly Contest 1',
    description: 'Algorithmic contest',
    startTime: new Date(),
    endTime: new Date(Date.now() + 7200000),
    collegeId: null,
    createdById: 'user-1',
    status: ContestStatus.UPCOMING,
    createdAt: new Date(),
    updatedAt: new Date(),
    problems: [],
    registrations: [],
    _count: { problems: 0, registrations: 0, submissions: 0 },
  };

  beforeEach(() => {
    prisma = {
      contest: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      contestRegistration: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      contestProblem: {
        upsert: vi.fn(),
      },
      problem: {
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new ContestsService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contest', async () => {
      vi.mocked(prisma.contest.create).mockResolvedValue(mockContest as any);

      const result = await service.create(
        {
          title: 'Biweekly Contest 1',
          startTime: mockContest.startTime,
          endTime: mockContest.endTime,
        },
        'user-1',
      );

      expect(result).toEqual(mockContest);
      expect(prisma.contest.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return contest details', async () => {
      vi.mocked(prisma.contest.findUnique).mockResolvedValue(mockContest as any);

      const result = await service.findById('contest-1');
      expect(result).toEqual(mockContest);
    });

    it('should throw NotFoundException if contest does not exist', async () => {
      vi.mocked(prisma.contest.findUnique).mockResolvedValue(null);

      await expect(service.findById('unknown-contest')).rejects.toThrow(NotFoundException);
    });
  });
});
