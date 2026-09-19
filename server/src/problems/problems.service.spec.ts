import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProblemsService } from './problems.service.js';

describe('ProblemsService', () => {
  let service: ProblemsService;
  let prisma: PrismaService;

  const mockProblem = {
    id: 'prob-1',
    title: 'Two Sum',
    slug: 'two-sum',
    statement: 'Find two indices that sum up to target',
    inputFormat: 'Array and target',
    outputFormat: 'Indices',
    constraints: 'N <= 10^5',
    difficulty: ProblemDifficulty.EASY,
    timeLimit: 1000,
    memoryLimit: 256,
    institutionId: null,
    createdById: 'user-1',
    status: ProblemStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
    testCases: [
      { id: 'tc-1', problemId: 'prob-1', input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, order: 0 },
    ],
    _count: { submissions: 10, testCases: 1 },
  };

  beforeEach(() => {
    prisma = {
      problem: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      testCase: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new ProblemsService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a problem with slug generation', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.problem.create).mockResolvedValue(mockProblem as any);

      const result = await service.create(
        {
          title: 'Two Sum',
          statement: 'Find two indices',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          difficulty: ProblemDifficulty.EASY,
          timeLimit: 1000,
          memoryLimit: 256,
        },
        'user-1',
      );

      expect(result).toEqual(mockProblem);
      expect(prisma.problem.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate slug', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(mockProblem as any);

      await expect(
        service.create(
          {
            title: 'Two Sum',
            statement: 'Find two indices',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            difficulty: ProblemDifficulty.EASY,
            timeLimit: 1000,
            memoryLimit: 256,
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByIdOrSlug', () => {
    it('should return a problem when found', async () => {
      vi.mocked(prisma.problem.findFirst).mockResolvedValue(mockProblem as any);
      vi.mocked(prisma.testCase.findMany).mockResolvedValue(mockProblem.testCases as any);

      const result = await service.findByIdOrSlug('two-sum');
      expect(result).toEqual(mockProblem);
    });

    it('should throw NotFoundException if problem does not exist', async () => {
      vi.mocked(prisma.problem.findFirst).mockResolvedValue(null);

      await expect(service.findByIdOrSlug('unknown-problem')).rejects.toThrow(NotFoundException);
    });
  });
});
