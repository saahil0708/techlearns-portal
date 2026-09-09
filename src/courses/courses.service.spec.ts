import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { CoursesService } from './courses.service.js';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaService;

  const mockCourse = {
    id: 'course-1',
    title: 'DSA in C++',
    description: 'Master Data Structures',
    collegeId: 'college-1',
    createdById: 'user-faculty-1',
    status: CourseStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: {
            college: { findUnique: vi.fn() },
            course: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            module: {
              create: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            lesson: {
              create: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            enrollment: {
              upsert: vi.fn(),
              findMany: vi.fn(),
            },
            lessonProgress: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              count: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create a course with collegeId', async () => {
      vi.spyOn(prisma.college, 'findUnique').mockResolvedValue({ id: 'college-1' } as any);
      vi.spyOn(prisma.course, 'create').mockResolvedValue(mockCourse as any);

      const result = await service.createCourse('user-faculty-1', {
        title: 'DSA in C++',
        collegeId: 'college-1',
      });

      expect(result).toEqual(mockCourse);
    });
  });

  describe('findCourseById', () => {
    it('should return course by ID', async () => {
      vi.spyOn(prisma.course, 'findUnique').mockResolvedValue(mockCourse as any);

      const result = await service.findCourseById('course-1');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      vi.spyOn(prisma.course, 'findUnique').mockResolvedValue(null);

      await expect(service.findCourseById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('enrollStudent', () => {
    it('should enroll user in course', async () => {
      vi.spyOn(prisma.course, 'findUnique').mockResolvedValue(mockCourse as any);
      vi.spyOn(prisma.enrollment, 'upsert').mockResolvedValue({
        id: 'enr-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
      } as any);

      const result = await service.enrollStudent('course-1', 'student-1');
      expect(result.id).toBe('enr-1');
    });
  });

  describe('updateLessonProgress', () => {
    it('should update progress record', async () => {
      vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue({ id: 'lesson-1' } as any);
      vi.spyOn(prisma.lessonProgress, 'upsert').mockResolvedValue({
        id: 'lp-1',
        lessonId: 'lesson-1',
        userId: 'student-1',
        completed: true,
      } as any);

      const result = await service.updateLessonProgress('lesson-1', 'student-1', true);
      expect(result.completed).toBe(true);
    });
  });
});
