import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BatchesResolver } from './batches.resolver.js';
import { BatchesService } from './batches.service.js';

describe('BatchesResolver', () => {
  let resolver: BatchesResolver;
  let service: BatchesService;

  const mockBatch = {
    id: 'batch-1',
    name: 'CS 2026 Batch A',
    collegeId: 'college-1',
    maxCapacity: 100,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const superAdminUser: CurrentUserPayload = {
    id: 'admin-1',
    email: 'admin@test.com',
    username: 'admin',
    globalRole: Role.SUPER_ADMIN,
    memberships: [],
  };

  const collegeAdminUser: CurrentUserPayload = {
    id: 'college-admin-1',
    email: 'cadmin@test.com',
    username: 'cadmin',
    globalRole: Role.USER,
    memberships: [{ id: 'm-1', collegeId: 'college-1', role: Role.COLLEGE_ADMIN }],
  };

  const unauthorizedUser: CurrentUserPayload = {
    id: 'unauth-1',
    email: 'user@test.com',
    username: 'user',
    globalRole: Role.USER,
    memberships: [{ id: 'm-2', collegeId: 'college-2', role: Role.STUDENT }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesResolver,
        {
          provide: BatchesService,
          useValue: {
            findPaginated: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            assignStudents: vi.fn(),
            removeStudent: vi.fn(),
            getStudentsPaginated: vi.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<BatchesResolver>(BatchesResolver);
    service = module.get<BatchesService>(BatchesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getBatches', () => {
    it('should allow SuperAdmin to fetch batches across any college', async () => {
      const mockResult = {
        items: [mockBatch],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      };
      vi.spyOn(service, 'findPaginated').mockResolvedValue(mockResult as any);

      const result = await resolver.getBatches(superAdminUser, { page: 1, limit: 10 }, 'college-1');
      expect(result).toEqual(mockResult);
    });

    it('should reject unauthorized user querying another college', async () => {
      await expect(
        resolver.getBatches(unauthorizedUser, { page: 1, limit: 10 }, 'college-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createBatch', () => {
    it('should allow CollegeAdmin to create a batch in their college', async () => {
      vi.spyOn(service, 'create').mockResolvedValue(mockBatch as any);

      const result = await resolver.createBatch(collegeAdminUser, {
        name: 'CS 2026 Batch A',
        collegeId: 'college-1',
        maxCapacity: 60,
      });

      expect(result).toEqual(mockBatch);
    });

    it('should reject non-admin users from creating a batch', async () => {
      await expect(
        resolver.createBatch(unauthorizedUser, {
          name: 'CS 2026 Batch A',
          collegeId: 'college-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignStudentsToBatch', () => {
    it('should assign students with roll numbers', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockBatch as any);
      vi.spyOn(service, 'assignStudents').mockResolvedValue([
        { id: 'bs-1', batchId: 'batch-1', userId: 'student-1', rollNo: 'CS001', enrolledAt: new Date() },
      ] as any);

      const result = await resolver.assignStudentsToBatch(collegeAdminUser, {
        batchId: 'batch-1',
        students: [{ userId: 'student-1', rollNo: 'CS001' }],
      });

      expect(result).toHaveLength(1);
    });
  });
});
