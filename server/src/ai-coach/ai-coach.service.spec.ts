import { Test, TestingModule } from '@nestjs/testing';
import { AICoachService } from './ai-coach.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AIProviderService } from '../common/ai/ai-provider.service.js';
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

  const mockAIProviderService = {
    explainProblem: vi.fn().mockResolvedValue('Structured problem explanation with trace walkthrough.'),
    getProgressiveHint: vi.fn().mockResolvedValue({ level: 1, hint: 'Consider using a hash table.' }),
    diagnoseFailure: vi.fn().mockResolvedValue('Check your base case in recursion.'),
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
        {
          provide: AIProviderService,
          useValue: mockAIProviderService,
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
    expect(result.aiMessage.text).toBeDefined();
  });

  it('should explain problem with trace example', async () => {
    const result = await service.explainProblem({
      title: 'Two Sum',
      statement: 'Given an array of integers...',
    });
    expect(result.success).toBe(true);
    expect(result.data.explanation).toContain('Structured problem explanation');
  });

  it('should get progressive hint level 1', async () => {
    const result = await service.getProgressiveHint({
      title: 'Two Sum',
      statement: 'Given an array...',
      level: 1,
    });
    expect(result.success).toBe(true);
    expect(result.data.hint).toContain('hash table');
  });
});
