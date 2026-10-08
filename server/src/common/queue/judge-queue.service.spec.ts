import { describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { JudgeQueueService } from './judge-queue.service.js';

describe('JudgeQueueService', () => {
  it('should initialize without connection string in fallback mode', () => {
    const configService = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new JudgeQueueService(configService);
    expect(service).toBeDefined();
  });

  it('should throw error when executing sendSubmissionJob without initialized sender', async () => {
    const configService = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new JudgeQueueService(configService);
    await expect(service.sendSubmissionJob('sub-test-123')).rejects.toThrow(
      'Azure Service Bus sender is unavailable',
    );
  });
});
