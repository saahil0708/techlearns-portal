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
});
