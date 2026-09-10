import {
  ProgrammingLanguage,
  SubmissionStatus,
  SubmissionVerdict,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { JudgeService } from './judge.service.js';

describe('JudgeService', () => {
  let service: JudgeService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      submission: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new JudgeService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fail closed when no isolated sandbox is configured', async () => {
    const configuredImage = process.env.JUDGE_IMAGE;
    delete process.env.JUDGE_IMAGE;

    const mockSubmission = {
      id: 'sub-1',
      sourceCode: 'print("hello")',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [
          { id: 'tc-1', input: 'input1', expectedOutput: 'input1', order: 0 },
        ],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    await service.evaluateSubmission('sub-1');
    process.env.JUDGE_IMAGE = configuredImage;

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: { status: SubmissionStatus.PROCESSING },
      }),
    );

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          status: SubmissionStatus.FAILED,
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          passedTestCases: 0,
          totalTestCases: 1,
        }),
      }),
    );
  });

  it('should return SYSTEM_ERROR when problem has 0 test cases', async () => {
    const mockSubmission = {
      id: 'sub-empty',
      sourceCode: 'print("hello")',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);

    await service.evaluateSubmission('sub-empty');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-empty' },
        data: expect.objectContaining({
          status: SubmissionStatus.FAILED,
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          passedTestCases: 0,
          totalTestCases: 0,
          runtime: 0,
          memory: 0,
          errorMessage: 'No test cases configured for problem',
        }),
      }),
    );
  });

  it('should fail closed when sandbox environment returns system error', async () => {
    const mockSubmission = {
      id: 'sub-mock',
      sourceCode: 'print("hello")',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [
          { id: 'tc-1', input: '1 2', expectedOutput: '3', order: 0 },
        ],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({ systemError: 'Sandbox offline' });

    await service.evaluateSubmission('sub-mock');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-mock' },
        data: expect.objectContaining({
          status: SubmissionStatus.FAILED,
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          passedTestCases: 0,
          totalTestCases: 1,
        }),
      }),
    );
  });

  it('should handle non-existent submission gracefully', async () => {
    vi.mocked(prisma.submission.findUnique).mockResolvedValue(null);

    await service.evaluateSubmission('non-existent');
    expect(prisma.submission.update).not.toHaveBeenCalled();
  });
});
