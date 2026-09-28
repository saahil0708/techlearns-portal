import { Test, TestingModule } from '@nestjs/testing';
import { AICoachService } from './ai-coach.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AICoachService', () => {
  let service: AICoachService;

  const mockPrismaService = {
    $transaction: vi.fn((cb: any) => cb(mockPrismaService)),
    aICoachMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AICoachService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AICoachService>(AICoachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return default welcome message if history is empty', async () => {
    mockPrismaService.aICoachMessage.findMany.mockResolvedValue([]);
    mockPrismaService.aICoachMessage.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'msg-1', ...data }),
    );

    const history = await service.getHistory('user-1');
    expect(history).toHaveLength(1);
    expect(history[0].sender).toBe('ai');
    expect(mockPrismaService.aICoachMessage.create).toHaveBeenCalled();
  });

  it('should handle user message and generate intelligent response', async () => {
    mockPrismaService.aICoachMessage.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'msg-rand', ...data }),
    );

    const result = await service.sendMessage('user-1', {
      message: 'Diagnose my recent TLE on my recursive solution',
    });

    expect(result.userMessage.text).toContain('TLE');
    expect(result.aiMessage.text).toContain('TLE');

    const lcsResult = await service.sendMessage('user-1', {
      message: 'Explain Longest Common Subsequence optimization',
    });

    expect(lcsResult.aiMessage.text).toContain('LCS');
    expect(lcsResult.aiMessage.codeSnippet).toBeDefined();
  });
});
