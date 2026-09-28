import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsService } from './simulations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';

describe('SimulationsService', () => {
  let service: SimulationsService;

  const mockPrismaService = {
    sprintTicket: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sprint ticket', async () => {
    mockPrismaService.sprintTicket.create.mockResolvedValue({
      id: 't-1',
      key: 'PAY-8921',
      title: 'Stripe Idempotency Key',
      status: 'Backlog',
    });

    const result = await service.createTicket(
      'user-1',
      {
        key: 'PAY-8921',
        title: 'Stripe Idempotency Key',
        description: 'Implement idempotency key middleware',
      },
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Tester',
        globalRole: Role.STUDENT,
        memberships: [],
      },
    );

    expect(result.id).toBe('t-1');
    expect(result.key).toBe('PAY-8921');
    expect(mockPrismaService.sprintTicket.create).toHaveBeenCalled();
  });

  it('should submit pull request for ticket review', async () => {
    mockPrismaService.sprintTicket.findUnique.mockResolvedValue({
      id: 't-1',
      key: 'PAY-8921',
      assigneeId: 'user-1',
    });
    mockPrismaService.sprintTicket.update.mockResolvedValue({
      id: 't-1',
      prNumber: '#142',
      status: 'In Review',
    });

    const result = await service.submitPullRequest(
      't-1',
      '#142',
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Tester',
        globalRole: Role.STUDENT,
        memberships: [],
      },
    );

    expect(result.status).toBe('In Review');
    expect(result.prNumber).toBe('#142');
  });
});
