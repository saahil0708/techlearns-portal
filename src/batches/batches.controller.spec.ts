import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BatchesController } from './batches.controller.js';
import { BatchesService } from './batches.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('BatchesController', () => {
  let controller: BatchesController;
  let service: BatchesService;

  const mockBatch = {
    id: 'batch-1',
    name: 'CS 2026 Batch A',
    collegeId: 'college-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchesController],
      providers: [
        {
          provide: BatchesService,
          useValue: {
            create: vi.fn().mockResolvedValue(mockBatch),
            findByCollege: vi.fn().mockResolvedValue([mockBatch]),
            findOne: vi.fn().mockResolvedValue(mockBatch),
            update: vi.fn().mockResolvedValue(mockBatch),
            delete: vi.fn().mockResolvedValue(mockBatch),
            assignStudents: vi.fn().mockResolvedValue([]),
            getStudents: vi.fn().mockResolvedValue([]),
            removeStudent: vi.fn().mockResolvedValue({ id: 'bs-1' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            batch: {
              findUnique: vi.fn().mockResolvedValue(mockBatch),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<BatchesController>(BatchesController);
    service = module.get<BatchesService>(BatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a batch', async () => {
    const dto = { name: 'CS 2026 Batch A', collegeId: 'college-1' };
    const result = await controller.create(dto);
    expect(result).toEqual(mockBatch);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find batches by college', async () => {
    const result = await controller.findByCollege('college-1');
    expect(result).toEqual([mockBatch]);
    expect(service.findByCollege).toHaveBeenCalledWith('college-1');
  });

  it('should find one batch by id', async () => {
    const result = await controller.findOne('batch-1');
    expect(result).toEqual(mockBatch);
    expect(service.findOne).toHaveBeenCalledWith('batch-1');
  });

  describe('assignStudents', () => {
    it('should prioritize non-empty students over userIds', async () => {
      const dto = {
        students: [{ userId: 'user-1', rollNo: 'CS001' }],
        userIds: ['user-2'],
      };
      await controller.assignStudents('batch-1', dto);
      expect(service.assignStudents).toHaveBeenCalledWith('batch-1', [
        { userId: 'user-1', rollNo: 'CS001' },
      ]);
    });

    it('should fallback to userIds when students array is empty', async () => {
      const dto = {
        students: [],
        userIds: ['user-1', 'user-2'],
      };
      await controller.assignStudents('batch-1', dto);
      expect(service.assignStudents).toHaveBeenCalledWith('batch-1', [
        'user-1',
        'user-2',
      ]);
    });

    it('should fallback to empty array when neither students nor userIds provided', async () => {
      const dto = {};
      await controller.assignStudents('batch-1', dto);
      expect(service.assignStudents).toHaveBeenCalledWith('batch-1', []);
    });
  });
});
