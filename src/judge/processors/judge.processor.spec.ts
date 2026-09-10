import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EVALUATE_SUBMISSION_JOB } from '../judge.constants.js';
import { JudgeService } from '../judge.service.js';
import { JudgeProcessor } from './judge.processor.js';

describe('JudgeProcessor', () => {
  let processor: JudgeProcessor;
  let judgeService: JudgeService;

  beforeEach(() => {
    judgeService = {
      evaluateSubmission: vi.fn().mockResolvedValue(undefined),
    } as unknown as JudgeService;

    processor = new JudgeProcessor(judgeService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should process evaluate-submission job and call judgeService', async () => {
    const mockJob = {
      id: 'job-1',
      name: EVALUATE_SUBMISSION_JOB,
      data: {
        submissionId: 'sub-123',
      },
    } as any;

    await processor.process(mockJob);

    expect(judgeService.evaluateSubmission).toHaveBeenCalledWith('sub-123');
  });

  it('should handle default job name and call judgeService', async () => {
    const mockJob = {
      id: 'job-2',
      name: '__default__',
      data: {
        submissionId: 'sub-456',
      },
    } as any;

    await processor.process(mockJob);

    expect(judgeService.evaluateSubmission).toHaveBeenCalledWith('sub-456');
  });
});

