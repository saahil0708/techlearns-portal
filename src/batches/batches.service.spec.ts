import { NotFoundException } from '@nestjs/common';
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
            },
            batchStudent: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              delete: vi.fn(),
              findMany: vi.fn(),
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
});
