import { Test, TestingModule } from '@nestjs/testing';
import { BootcampsService } from './bootcamps.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('BootcampsService', () => {
  let service: BootcampsService;

  const mockPrismaService = {
    bootcamp: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    bootcampEnrollment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => (typeof fn === 'function' ? fn(mockPrismaService) : Promise.all(fn))),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootcampsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BootcampsService>(BootcampsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBootcamp', () => {
    it('should create a bootcamp with generated slug', async () => {
      mockPrismaService.bootcamp.findUnique.mockResolvedValue(null);
      mockPrismaService.bootcamp.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'bc-1', ...data }),
      );

      const result = await service.createBootcamp('user-1', {
        title: 'Full Stack Sprint',
        track: 'Full Stack',
        instructor: 'Dr. Sarah Connor',
        duration: '6 Weeks',
      });

      expect(result.id).toBe('bc-1');
      expect(result.slug).toBe('full-stack-sprint');
      expect(result.instructor).toBe('Dr. Sarah Connor');
      expect(mockPrismaService.bootcamp.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated list and format user status properly', async () => {
      mockPrismaService.bootcamp.findMany.mockResolvedValue([
        {
          id: 'bc-1',
          slug: 'ai-sprint',
          title: 'AI Sprint',
          track: 'GenAI & LLMs',
          instructor: 'Dr. Vance',
          duration: '6 Weeks',
          level: 'Intermediate',
          rating: 4.9,
          maxSeats: 100,
          enrolledCount: 42,
          totalSessions: 12,
          status: 'PUBLISHED',
          createdAt: new Date(),
          _count: { enrollments: 8 },
          enrollments: [
            {
              id: 'enr-1',
              status: 'ACTIVE',
              progressPct: 50,
              sessionsCompleted: 6,
            },
          ],
        },
      ]);
      mockPrismaService.bootcamp.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, 'user-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('Enrolled');
      expect(result.items[0].progressPct).toBe(50);
      expect(result.items[0].enrolledStudents).toBe(42);
    });
  });

  describe('enroll', () => {
    it('should enroll user and increment count atomically', async () => {
      mockPrismaService.bootcampEnrollment.findUnique.mockResolvedValue(null);
      mockPrismaService.bootcamp.findUnique.mockResolvedValue({ id: 'bc-1', maxSeats: 100 });
      mockPrismaService.bootcamp.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.bootcampEnrollment.create.mockResolvedValue({ id: 'enr-1' });

      const result = await service.enroll('bc-1', 'user-1');

      expect(result.message).toBe('Successfully enrolled in bootcamp');
      expect(mockPrismaService.bootcamp.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'bc-1',
          status: { notIn: ['ARCHIVED', 'COMPLETED'] },
          enrolledCount: { lt: 100 },
        },
        data: {
          enrolledCount: { increment: 1 },
        },
      });
      expect(mockPrismaService.bootcampEnrollment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          bootcampId: 'bc-1',
          status: 'ACTIVE',
          progressPct: 0,
          sessionsCompleted: 0,
        },
      });
    });

    it('should return existing message if already enrolled without checking capacity', async () => {
      mockPrismaService.bootcampEnrollment.findUnique.mockResolvedValue({ id: 'enr-1' });

      const result = await service.enroll('bc-1', 'user-1');
      expect(result.message).toBe('Already enrolled in this bootcamp');
      expect(mockPrismaService.bootcamp.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.bootcamp.updateMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if seat reservation fails (full or closed)', async () => {
      mockPrismaService.bootcampEnrollment.findUnique.mockResolvedValue(null);
      mockPrismaService.bootcamp.findUnique.mockResolvedValue({ id: 'bc-1', maxSeats: 100 });
      mockPrismaService.bootcamp.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.enroll('bc-1', 'user-1')).rejects.toThrow(
        'Bootcamp is full or not open for enrollment',
      );
      expect(mockPrismaService.bootcampEnrollment.create).not.toHaveBeenCalled();
    });
  });
});
