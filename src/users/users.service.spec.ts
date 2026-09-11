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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: vi.fn(),
              create: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
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
        college: { findUnique: vi.fn().mockResolvedValue({ id: 'col-1' }) },
      };

      prisma.$transaction = vi.fn().mockImplementation(async (cb: any) => cb(txMock)) as any;

      const result = await service.bulkInvite({
        users: [{ email: 'student@example.com', name: 'Student 1', role: Role.STUDENT }],
      });

      expect(result.invited).toBe(1);
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
            collegeId: null,
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
  });
});
