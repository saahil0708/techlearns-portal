import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CollegeStatus, Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { CollegesService } from './colleges.service.js';

describe('CollegesService', () => {
  let service: CollegesService;
  let prisma: PrismaService;

  const mockCollege = {
    id: 'college-1',
    name: 'Tech University',
    code: 'TECH-U',
    email: 'info@tech.edu',
    phone: '123-456',
    address: 'Campus St',
    status: CollegeStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollegesService,
        {
          provide: PrismaService,
          useValue: {
            college: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            batch: {
              findMany: vi.fn(),
            },
            batchStudent: {
              deleteMany: vi.fn(),
            },
            user: {
              findUnique: vi.fn(),
            },
            collegeMembership: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              delete: vi.fn(),
              deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
              findMany: vi.fn(),
            },
            $transaction: vi.fn().mockImplementation((arg) => (typeof arg === 'function' ? arg(prisma) : Promise.all(arg))),
          },
        },
      ],
    }).compile();

    service = module.get<CollegesService>(CollegesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new college', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.college, 'create').mockResolvedValue(mockCollege as any);

      const result = await service.create({
        name: 'Tech University',
        code: 'TECH-U',
      });

      expect(result).toEqual(mockCollege);
    });

    it('should throw ConflictException if code already exists', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(mockCollege as any);

      await expect(
        service.create({
          name: 'Tech University',
          code: 'TECH-U',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return college by ID', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(mockCollege as any);

      const result = await service.findOne('college-1');
      expect(result).toEqual(mockCollege);
    });

    it('should throw NotFoundException if college not found', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMember', () => {
    it('should add a member to the college', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(mockCollege as any);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'user-1' } as any);
      vi.spyOn(prisma.collegeMembership, 'upsert').mockResolvedValue({
        id: 'mem-1',
        collegeId: 'college-1',
        userId: 'user-1',
        role: Role.FACULTY,
      } as any);

      const result = await service.addMember('college-1', {
        userId: 'user-1',
        role: Role.FACULTY,
      });

      expect(result.role).toBe(Role.FACULTY);
    });
  });

  describe('removeMember', () => {
    it('should remove a member and clean up batch enrollments', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(mockCollege as any);
      vi.spyOn(prisma.collegeMembership, 'findUnique').mockResolvedValue({
        id: 'mem-1',
        collegeId: 'college-1',
        userId: 'user-1',
        role: Role.STUDENT,
      } as any);
      vi.spyOn(prisma.batch, 'findMany').mockResolvedValue([{ id: 'batch-1' }] as any);
      vi.spyOn(prisma.batchStudent, 'deleteMany').mockResolvedValue({ count: 1 } as any);
      vi.spyOn(prisma.collegeMembership, 'delete').mockResolvedValue({ id: 'mem-1' } as any);

      const result = await service.removeMember('college-1', 'user-1');
      expect(result).toBe(true);
    });
  });
});
