import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { BatchesService } from './batches.service.js';

describe('BatchesService', () => {
  let service: BatchesService;
  let prisma: PrismaService;

  const mockBatch = {
    id: 'batch-1',
    name: 'CS 2026 Batch A',
    collegeId: 'college-1',
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesService,
        {
          provide: PrismaService,
          useValue: {
            college: {
              findUnique: vi.fn(),
            },
            batch: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              count: vi.fn(),
            },
            user: {
              findMany: vi.fn(),
            },
            batchStudent: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              delete: vi.fn(),
              findMany: vi.fn(),
              count: vi.fn(),
            },
            $transaction: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a batch under a college', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue({ id: 'college-1' } as any);
      vi.spyOn(prisma.batch, 'create').mockResolvedValue(mockBatch as any);

      const result = await service.create({
        name: 'CS 2026 Batch A',
        collegeId: 'college-1',
      });

      expect(result).toEqual(mockBatch);
    });

    it('should throw NotFoundException if college does not exist', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create({
          name: 'CS 2026 Batch A',
          collegeId: 'invalid-college',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return batch by ID', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(mockBatch as any);

      const result = await service.findOne('batch-1');
      expect(result).toEqual(mockBatch);
    });

    it('should throw NotFoundException if batch not found', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPaginated', () => {
    it('should return paginated batches', async () => {
      vi.spyOn(prisma.batch, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.batch, 'findMany').mockResolvedValue([mockBatch] as any);

      const result = await service.findPaginated({ page: 1, limit: 10, search: 'CS' }, 'college-1');

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('assignStudents', () => {
    it('should assign students with roll numbers', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(mockBatch as any);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([
        { id: 'user-1', memberships: [{ id: 'm-1' }] },
      ] as any);
      vi.spyOn(prisma.batchStudent, 'upsert').mockReturnValue({} as any);
      vi.spyOn(prisma, '$transaction').mockResolvedValue([] as any);
      vi.spyOn(prisma.batchStudent, 'findMany').mockResolvedValue([
        { id: 'bs-1', batchId: 'batch-1', userId: 'user-1', rollNo: 'CS001', user: { id: 'user-1' } },
      ] as any);

      const result = await service.assignStudents('batch-1', [
        { userId: 'user-1', rollNo: 'CS001' },
      ]);

      expect(result).toHaveLength(1);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should reject assigning students who do not belong to the college', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(mockBatch as any);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([
        { id: 'user-foreign', memberships: [] },
      ] as any);

      await expect(
        service.assignStudents('batch-1', [{ userId: 'user-foreign' }]),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeStudent', () => {
    it('should remove enrolled student', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(mockBatch as any);
      vi.spyOn(prisma.batchStudent, 'findUnique').mockResolvedValue({ id: 'bs-1' } as any);
      vi.spyOn(prisma.batchStudent, 'delete').mockResolvedValue({ id: 'bs-1' } as any);

      const result = await service.removeStudent('batch-1', 'user-1');
      expect(result).toEqual({ id: 'bs-1' });
    });

    it('should throw NotFoundException when student is not enrolled', async () => {
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue(mockBatch as any);
      vi.spyOn(prisma.batchStudent, 'findUnique').mockResolvedValue(null);

      await expect(service.removeStudent('batch-1', 'user-not-found')).rejects.toThrow(NotFoundException);
    });
  });
});
