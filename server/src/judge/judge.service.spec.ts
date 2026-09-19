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

  it('should evaluate and return ACCEPTED when all test cases match', async () => {
    const mockSubmission = {
      id: 'sub-ac',
      sourceCode: 'print(input())',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [
          { id: 'tc-1', input: 'hello\n', expectedOutput: 'hello\r\n', order: 0 },
          { id: 'tc-2', input: 'world', expectedOutput: 'world  ', order: 1 },
        ],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox')
      .mockResolvedValueOnce({ output: 'hello', memory: 32 })
      .mockResolvedValueOnce({ output: 'world', memory: 32 });

    await service.evaluateSubmission('sub-ac');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-ac' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.ACCEPTED,
          passedTestCases: 2,
          totalTestCases: 2,
        }),
      }),
    );
  });

  it('should return WRONG_ANSWER when output does not match expected', async () => {
    const mockSubmission = {
      id: 'sub-wa',
      sourceCode: 'print(42)',
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
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({ output: '42', memory: 30 });

    await service.evaluateSubmission('sub-wa');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-wa' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.WRONG_ANSWER,
          passedTestCases: 0,
          totalTestCases: 1,
        }),
      }),
    );
  });

  it('should return TIME_LIMIT_EXCEEDED when execution times out', async () => {
    const mockSubmission = {
      id: 'sub-tle',
      sourceCode: 'while True: pass',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [{ id: 'tc-1', input: '', expectedOutput: '', order: 0 }],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({ timedOut: true, memory: 50 });

    await service.evaluateSubmission('sub-tle');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-tle' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
        }),
      }),
    );
  });

  it('should return MEMORY_LIMIT_EXCEEDED when memory is exceeded', async () => {
    const mockSubmission = {
      id: 'sub-mle',
      sourceCode: 'x = [0] * 100000000',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 64,
        testCases: [{ id: 'tc-1', input: '', expectedOutput: '', order: 0 }],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({ memoryLimitExceeded: true, memory: 64 });

    await service.evaluateSubmission('sub-mle');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-mle' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.MEMORY_LIMIT_EXCEEDED,
        }),
      }),
    );
  });

  it('should return COMPILATION_ERROR when code fails to compile', async () => {
    const mockSubmission = {
      id: 'sub-ce',
      sourceCode: 'int main() { syntax error }',
      language: ProgrammingLanguage.CPP,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [{ id: 'tc-1', input: '', expectedOutput: '', order: 0 }],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({
      compilationError: 'error: expected ";" before "error"',
      memory: 10,
    });

    await service.evaluateSubmission('sub-ce');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-ce' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.COMPILATION_ERROR,
          errorMessage: 'error: expected ";" before "error"',
        }),
      }),
    );
  });

  it('should return RUNTIME_ERROR when execution throws an unhandled exception', async () => {
    const mockSubmission = {
      id: 'sub-re',
      sourceCode: '1 / 0',
      language: ProgrammingLanguage.PYTHON,
      problem: {
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: [{ id: 'tc-1', input: '', expectedOutput: '', order: 0 }],
      },
    };

    vi.mocked(prisma.submission.findUnique).mockResolvedValue(mockSubmission as any);
    vi.mocked(prisma.submission.update).mockResolvedValue({} as any);
    vi.spyOn(service as any, 'executeInSandbox').mockResolvedValue({
      runtimeError: 'ZeroDivisionError: division by zero',
      memory: 20,
    });

    await service.evaluateSubmission('sub-re');

    expect(prisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-re' },
        data: expect.objectContaining({
          status: SubmissionStatus.COMPLETED,
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          errorMessage: 'ZeroDivisionError: division by zero',
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
