import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, UserStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashed',
    globalRole: Role.STUDENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [],
  };

  const mockSanitizedUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    globalRole: Role.STUDENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [],
  };

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    studentDiagnostic: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    studentGoal: {
      create: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    submission: {
      findMany: vi.fn(),
    },
    enrollment: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    prisma.$transaction = vi.fn((cb) => (typeof cb === 'function' ? cb(prisma) : Promise.all(cb))) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return user with passwordHash for authentication', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { memberships: true },
      });
    });

    it('should return null if user not found', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return sanitized user profile', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockSanitizedUser as any);

      const result = await service.findById('user-uuid-1');
      expect(result).toEqual(mockSanitizedUser);
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('getProfile', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create and return a sanitized user', async () => {
      vi.spyOn(prisma.user, 'create').mockResolvedValue(mockSanitizedUser as any);

      const result = await service.createUser({
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
      });

      expect(result).toEqual(mockSanitizedUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('invitation encryption & delivery outbox', () => {
    it('should encrypt and decrypt activation URLs correctly', () => {
      const originalUrl = 'http://localhost:3000/accept-invitation?token=secret_token_123';
      const encrypted = service.encryptActivationUrl(originalUrl);

      expect(encrypted).toMatch(/^enc:v1:/);
      expect(encrypted).not.toContain('secret_token_123');

      const decrypted = service.decryptActivationUrl(encrypted);
      expect(decrypted).toBe(originalUrl);
    });

    it('should persist encrypted activationUrl in outbox during bulkInvite', async () => {
      const createdInvitations: any[] = [];
      const createdDeliveries: any[] = [];

      const txMock = {
        user: { findUnique: vi.fn().mockResolvedValue(null) },
        userInvitation: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(async ({ data }) => {
            createdInvitations.push(data);
            return { id: 'inv-1', ...data };
          }),
        },
        invitationDelivery: {
          create: vi.fn().mockImplementation(async ({ data }) => {
            createdDeliveries.push(data);
            return { id: 'del-1', ...data };
          }),
        },
        institution: { findUnique: vi.fn().mockResolvedValue({ id: 'col-1' }) },
      };

      prisma.$transaction = vi.fn().mockImplementation(async (cb: any) => cb(txMock)) as any;

      const result = await service.bulkInvite({
        users: [{ email: 'student@example.com', name: 'Student 1', role: Role.STUDENT }],
      });

      expect(result.invited).toBe(1);
      expect(result.expiresInHours).toBe(72);
      expect(result.invitationLinks).toHaveLength(1);
      expect(result.invitationLinks?.[0].email).toBe('student@example.com');
      expect(result.invitationLinks?.[0].activationUrl).toContain('accept-invitation');
      expect(createdDeliveries.length).toBe(1);
      expect(createdDeliveries[0].activationUrl).toMatch(/^enc:v1:/);
      expect(createdDeliveries[0].activationUrl).not.toContain('accept-invitation');
    });

    it('should redact activationUrl upon successful acceptInvitation', async () => {
      const updatedDeliveries: any[] = [];
      const txMock = {
        userInvitation: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'inv-1',
            email: 'student@example.com',
            name: 'Student 1',
            role: Role.STUDENT,
            institutionId: null,
            expiresAt: new Date(Date.now() + 100000),
            acceptedAt: null,
            revokedAt: null,
          }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockSanitizedUser),
        },
        invitationDelivery: {
          updateMany: vi.fn().mockImplementation(async (args) => {
            updatedDeliveries.push(args);
            return { count: 1 };
          }),
        },
      };

      prisma.$transaction = vi.fn().mockImplementation(async (cb: any) => cb(txMock)) as any;

      const result = await service.acceptInvitation('raw_token', 'NewSecurePassword123!');
      expect(result).toBeDefined();
      expect(updatedDeliveries.length).toBe(1);
      expect(updatedDeliveries[0].data.activationUrl).toBeNull();
      expect(updatedDeliveries[0].data.status).toBe('DELIVERED');
    });

    it('should enroll user into batchStudent when invitation has batchId', async () => {
      const batchStudentUpsertMock = vi.fn().mockResolvedValue({ id: 'bs-1' });
      const txMock = {
        userInvitation: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'inv-batch-1',
            email: 'batchstudent@example.com',
            name: 'Batch Student',
            role: Role.STUDENT,
            institutionId: 'institution-1',
            batchId: 'batch-alpha-1',
            expiresAt: new Date(Date.now() + 100000),
            acceptedAt: null,
            revokedAt: null,
          }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockSanitizedUser),
        },
        institutionMembership: {
          create: vi.fn().mockResolvedValue({ id: 'cm-1' }),
        },
        batchStudent: {
          upsert: batchStudentUpsertMock,
        },
        invitationDelivery: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };

      prisma.$transaction = vi.fn().mockImplementation(async (cb: any) => cb(txMock)) as any;

      const result = await service.acceptInvitation('raw_token_batch', 'NewSecurePassword123!');
      expect(result).toBeDefined();
      expect(batchStudentUpsertMock).toHaveBeenCalledWith({
        where: {
          batchId_userId: {
            batchId: 'batch-alpha-1',
            userId: mockSanitizedUser.id,
          },
        },
        update: {},
        create: {
          batchId: 'batch-alpha-1',
          userId: mockSanitizedUser.id,
        },
      });
    });
  });

  describe('Student Diagnostics & Goals', () => {
    it('should save student diagnostic and sync goals', async () => {
      const mockDiag = {
        id: 'diag-1',
        userId: 'user-uuid-1',
        targetTrack: 'Full-Stack Web Architect',
        targetTrackId: 'fullstack',
        timeline: '6 months (Standard)',
        weeklyHours: 14,
        roleFitScore: 85,
        quizScore: '8/10',
        skills: [{ id: 'prog', name: 'Programming', level: 85, label: 'Advanced' }],
      };

      (prisma.studentDiagnostic.create as any).mockResolvedValue(mockDiag);
      (prisma.studentGoal.upsert as any).mockResolvedValue(mockDiag);

      const result = await service.saveDiagnostic('user-uuid-1', {
        targetTrack: 'Full-Stack Web Architect',
        targetTrackId: 'fullstack',
        timeline: '6 months (Standard)',
        weeklyHours: 14,
        roleFitScore: 85,
        quizScore: '8/10',
        skills: [{ id: 'prog', name: 'Programming', level: 85, label: 'Advanced' }],
      });

      expect(result.id).toBe('diag-1');
      expect(prisma.studentDiagnostic.create).toHaveBeenCalled();
      expect(prisma.studentGoal.upsert).toHaveBeenCalled();
    });

    it('should get latest diagnostic', async () => {
      const mockDiag = { id: 'diag-latest', userId: 'user-uuid-1' };
      (prisma.studentDiagnostic.findFirst as any).mockResolvedValue(mockDiag);

      const result = await service.getLatestDiagnostic('user-uuid-1');
      expect(result?.id).toBe('diag-latest');
    });

    it('should save and get student goals', async () => {
      const mockGoal = {
        id: 'goal-1',
        userId: 'user-uuid-1',
        targetTrack: 'Full-Stack Web Architect',
        targetTrackId: 'fullstack',
      };
      (prisma.studentGoal.upsert as any).mockResolvedValue(mockGoal);
      (prisma.studentGoal.findUnique as any).mockResolvedValue(mockGoal);

      const saved = await service.saveGoals('user-uuid-1', {
        targetTrack: 'Full-Stack Web Architect',
        targetTrackId: 'fullstack',
      });
      expect(saved.id).toBe('goal-1');

      const retrieved = await service.getGoals('user-uuid-1');
      expect(retrieved?.id).toBe('goal-1');
    });

    it('should compute aggregated growth metrics', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        contestRating: 1650,
        ratingTier: 'Intermediate',
      });
      (prisma.submission.findMany as any).mockResolvedValue([
        { verdict: 'ACCEPTED', problemId: 'prob-1', problem: { difficulty: 'EASY' } },
        { verdict: 'ACCEPTED', problemId: 'prob-2', problem: { difficulty: 'MEDIUM' } },
        { verdict: 'WRONG_ANSWER', problemId: 'prob-3', problem: { difficulty: 'HARD' } },
      ]);
      (prisma.enrollment.findMany as any).mockResolvedValue([
        { status: 'ACTIVE' },
        { status: 'COMPLETED' },
      ]);
      (prisma.studentGoal.findUnique as any).mockResolvedValue({
        roleFitScore: 82,
      });

      const metrics = await service.getGrowthMetrics('user-uuid-1');
      expect(metrics.solvedByDifficulty.total).toBe(2);
      expect(metrics.solvedByDifficulty.easy).toBe(1);
      expect(metrics.solvedByDifficulty.medium).toBe(1);
      expect(metrics.coursesEnrolled).toBe(2);
      expect(metrics.coursesCompleted).toBe(1);
      expect(metrics.contestRating).toBe(1650);
      expect(metrics.roleReadiness.fullstack).toBeGreaterThanOrEqual(80);
    });
  });
});

