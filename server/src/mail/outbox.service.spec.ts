import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { MailService } from './mail.service.js';
import { OutboxService } from './outbox.service.js';

describe('OutboxService', () => {
  let service: OutboxService;
  let usersService: { processPendingDeliveries: ReturnType<typeof vi.fn> };
  let mailService: { sendInvitationEmail: ReturnType<typeof vi.fn> };
  let prisma: {
    invitationDelivery: {
      count: ReturnType<typeof vi.fn>;
    };
    userInvitation: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    usersService = {
      processPendingDeliveries: vi.fn(),
    };
    mailService = {
      sendInvitationEmail: vi.fn(),
    };
    prisma = {
      invitationDelivery: {
        count: vi.fn(),
      },
      userInvitation: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute processOutboxBatch via usersService', async () => {
    usersService.processPendingDeliveries.mockResolvedValue({ delivered: 3, expired: 1 });

    const result = await service.processOutboxBatch();
    expect(result.delivered).toBe(3);
    expect(result.expired).toBe(1);
    expect(usersService.processPendingDeliveries).toHaveBeenCalled();
  });

  it('should return accurate outbox metrics', async () => {
    prisma.invitationDelivery.count
      .mockResolvedValueOnce(5)  // pending
      .mockResolvedValueOnce(20) // delivered
      .mockResolvedValueOnce(2)  // expired
      .mockResolvedValueOnce(0); // claimed

    const metrics = await service.getOutboxMetrics();
    expect(metrics.pending).toBe(5);
    expect(metrics.delivered).toBe(20);
    expect(metrics.expired).toBe(2);
    expect(metrics.failed).toBe(0);
  });
});
