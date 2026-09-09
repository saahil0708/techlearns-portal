import { NotFoundException } from '@nestjs/common';
import { ProgrammingLanguage, SubmissionStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { SubmissionsService } from './submissions.service.js';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prisma: PrismaService;

  const mockSubmission = {
    id: 'sub-1',
    userId: 'user-1',
    problemId: 'prob-1',
    contestId: null,
    language: ProgrammingLanguage.PYTHON,
    sourceCode: 'print("Hello")',
    status: SubmissionStatus.QUEUED,
    verdict: null,
    runtime: null,
    memory: null,
    errorMessage: null,
    passedTestCases: 0,
    totalTestCases: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-1', name: 'Student 1', email: 'student@test.com' },
    problem: { id: 'prob-1', title: 'Two Sum' },
  };

  beforeEach(() => {
    prisma = {
      problem: {
        findUnique: vi.fn(),
      },
      submission: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new SubmissionsService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a queued submission', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue({
        id: 'prob-1',
        testCases: [{ id: 'tc-1' }, { id: 'tc-2' }],
      } as any);

      vi.mocked(prisma.submission.create).mockResolvedValue(mockSubmission as any);

      const result = await service.create(
        {
          problemId: 'prob-1',
          language: ProgrammingLanguage.PYTHON,
          sourceCode: 'print("Hello")',
        },
        'user-1',
      );

      expect(result).toEqual(mockSubmission);
      expect(prisma.submission.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if problem does not exist', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(null);

      await expect(
        service.create(
          {
            problemId: 'unknown-prob',
            language: ProgrammingLanguage.PYTHON,
            sourceCode: 'print("Hello")',
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return submission when found', async () => {
      vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);

      const result = await service.findById('sub-1');
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when submission not found', async () => {
      vi.mocked(prisma.submission.findUnique).mockResolvedValue(null);

      await expect(service.findById('unknown-sub')).rejects.toThrow(NotFoundException);
    });
  });
});
