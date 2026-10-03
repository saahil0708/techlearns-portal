import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    slug: 'dsa-in-cpp',
    description: 'Master Data Structures',
    institutionId: 'institution-1',
    createdById: 'user-faculty-1',
    status: CourseStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [],
  };

  const mockUser: any = {
    id: 'user-faculty-1',
    email: 'faculty@institution.edu',
    globalRole: 'FACULTY',
    memberships: [{ institutionId: 'institution-1', role: 'FACULTY' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn((cb) => (typeof cb === 'function' ? cb(prisma) : Promise.all(cb))),
            institution: { findUnique: vi.fn() },
            batch: { findUnique: vi.fn() },
            course: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              findUniqueOrThrow: vi.fn(),
              findFirst: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              count: vi.fn(),
            },
            module: {
              create: vi.fn(),
              findUnique: vi.fn(),
              findMany: vi.fn(),
              findFirst: vi.fn(),
              update: vi.fn(),
              updateMany: vi.fn(),
              delete: vi.fn(),
            },
            lesson: {
              create: vi.fn(),
              findUnique: vi.fn(),
              findMany: vi.fn(),
              findFirst: vi.fn(),
              update: vi.fn(),
              updateMany: vi.fn(),
              delete: vi.fn(),
            },
            enrollment: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              findMany: vi.fn(),
              count: vi.fn(),
              update: vi.fn(),
            },
            lessonProgress: {
              upsert: vi.fn(),
              findUnique: vi.fn(),
              findMany: vi.fn(),
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
    it('should create a course with institutionId and unique slug', async () => {
      vi.spyOn(prisma.institution, 'findUnique').mockResolvedValue({ id: 'institution-1' } as any);
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.course, 'create').mockResolvedValue(mockCourse as any);

      const result = await service.createCourse('user-faculty-1', {
        title: 'DSA in C++',
        institutionId: 'institution-1',
      }, mockUser);

      expect(result).toEqual(mockCourse);
    });
  });

  describe('createCompositeCourse', () => {
    it('should create a course with modules and lessons in a single transaction', async () => {
      vi.spyOn(prisma.institution, 'findUnique').mockResolvedValue({ id: 'institution-1' } as any);
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.course, 'create').mockResolvedValue(mockCourse as any);
      vi.spyOn(prisma.module, 'create').mockResolvedValue({ id: 'module-1', title: 'Mod 1', order: 0 } as any);
      vi.spyOn(prisma.lesson, 'create').mockResolvedValue({ id: 'lesson-1', title: 'Les 1', order: 0 } as any);
      vi.spyOn(prisma.course, 'findUniqueOrThrow').mockResolvedValue({
        ...mockCourse,
        modules: [
          {
            id: 'module-1',
            title: 'Mod 1',
            lessons: [{ id: 'lesson-1', title: 'Les 1' }],
          },
        ],
      } as any);

      const result = await service.createCompositeCourse('user-faculty-1', {
        title: 'DSA in C++',
        institutionId: 'institution-1',
        modules: [
          {
            title: 'Mod 1',
            lessons: [
              {
                title: 'Les 1',
                content: '# Intro',
                type: 'reading',
              },
            ],
          },
        ],
      }, mockUser);

      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].lessons).toHaveLength(1);
    });
  });

  describe('publishCourse', () => {
    it('should throw BadRequestException if course has no modules or lessons', async () => {
      vi.spyOn(prisma.course, 'findUnique').mockResolvedValue({
        ...mockCourse,
        modules: [],
      } as any);

      await expect(service.publishCourse('course-1', mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should publish course when it contains at least one module and lesson', async () => {
      vi.spyOn(prisma.course, 'findUnique').mockResolvedValue({
        ...mockCourse,
        modules: [{ id: 'm-1', lessons: [{ id: 'l-1' }] }],
      } as any);
      vi.spyOn(prisma.course, 'update').mockResolvedValue({
        ...mockCourse,
        status: CourseStatus.PUBLISHED,
      } as any);

      const result = await service.publishCourse('course-1', mockUser);
      expect(result.status).toBe(CourseStatus.PUBLISHED);
    });
  });

  describe('reorderModules', () => {
    it('should batch update order of modules', async () => {
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(mockCourse as any);
      vi.spyOn(prisma.module, 'findMany').mockResolvedValue([
        { id: 'm-2', order: 0 },
        { id: 'm-1', order: 1 },
      ] as any);

      const result = await service.reorderModules(
        'course-1',
        {
          modules: [
            { id: 'm-2', order: 0 },
            { id: 'm-1', order: 1 },
          ],
        },
        mockUser,
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('enrollBatchStudents', () => {
    it('should enroll all students of a batch into the course', async () => {
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(mockCourse as any);
      vi.spyOn(prisma.batch, 'findUnique').mockResolvedValue({
        id: 'batch-1',
        name: 'CSE 2026',
        institutionId: 'institution-1',
        students: [{ userId: 's-1' }, { userId: 's-2' }],
      } as any);
      vi.spyOn(prisma.enrollment, 'upsert').mockResolvedValue({ id: 'enr-1' } as any);

      const result = await service.enrollBatchStudents(
        'course-1',
        { batchId: 'batch-1' },
        mockUser,
      );

      expect(result.totalBatchStudents).toBe(2);
      expect(result.enrolledCount).toBe(2);
    });
  });

  describe('getCourseRoster and exportCourseRosterCsv', () => {
    it('should return paginated gradebook roster in table format', async () => {
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue({
        ...mockCourse,
        modules: [{ id: 'm-1', lessons: [{ id: 'l-1' }, { id: 'l-2' }] }],
      } as any);
      vi.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([
        {
          id: 'enr-1',
          userId: 's-1',
          user: { id: 's-1', name: 'John Doe', email: 'john@edu.com', rollNo: 'CS01' },
          status: 'ACTIVE',
          enrolledAt: new Date(),
          completedAt: null,
        },
      ] as any);
      vi.spyOn(prisma.enrollment, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.lessonProgress, 'findMany').mockResolvedValue([
        { userId: 's-1', lessonId: 'l-1', completedAt: new Date() },
      ] as any);

      const result = await service.getCourseRoster('course-1', { page: 1, limit: 10 }, mockUser);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].progressPercent).toBe(50);
      expect(result.items[0].completedLessons).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should generate CSV formatted export of gradebook roster', async () => {
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue({
        ...mockCourse,
        modules: [{ id: 'm-1', lessons: [{ id: 'l-1' }] }],
      } as any);
      vi.spyOn(prisma.enrollment, 'findMany').mockResolvedValue([
        {
          id: 'enr-1',
          userId: 's-1',
          user: { id: 's-1', name: 'John Doe', email: 'john@edu.com', rollNo: 'CS01' },
          status: 'ACTIVE',
          enrolledAt: new Date('2026-01-01T00:00:00Z'),
          completedAt: null,
        },
      ] as any);
      vi.spyOn(prisma.lessonProgress, 'findMany').mockResolvedValue([
        { userId: 's-1', completedAt: new Date('2026-01-02T00:00:00Z') },
      ] as any);

      const csv = await service.exportCourseRosterCsv('course-1', mockUser);
      expect(csv).toContain('"Student Name","Email","Roll No"');
      expect(csv).toContain('"John Doe","john@edu.com","CS01"');
    });
  });

  describe('findCourseById', () => {
    it('should query both id and slug fields in findFirst', async () => {
      const spy = vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(mockCourse as any);

      const result = await service.findCourseById('seeded-custom-course-1', mockUser);
      expect(result).toMatchObject(mockCourse);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ id: 'seeded-custom-course-1' }, { slug: 'seeded-custom-course-1' }],
          },
        }),
      );
    });

    it('should strip correctIndex from quizMCQ for student users in findCourseById', async () => {
      const studentUser: any = {
        id: 'student-1',
        globalRole: 'STUDENT',
        memberships: [{ institutionId: 'institution-1', role: 'STUDENT' }],
      };

      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue({
        ...mockCourse,
        modules: [
          {
            id: 'm-1',
            lessons: [
              {
                id: 'l-1',
                title: 'Lesson 1',
                quizMCQ: {
                  question: 'What is O(1)?',
                  options: ['Constant', 'Linear'],
                  correctIndex: 0,
                },
              },
            ],
          },
        ],
      } as any);
      vi.spyOn(prisma.enrollment, 'findUnique').mockResolvedValue({
        id: 'enr-1',
        userId: 'student-1',
        courseId: 'course-1',
        status: 'ACTIVE',
      } as any);
      vi.spyOn(prisma.lessonProgress, 'findMany').mockResolvedValue([] as any);

      const result = await service.findCourseById('course-1', studentUser);
      const lessonQuiz = (result.modules[0].lessons[0] as any).quizMCQ;
      expect(lessonQuiz).toBeDefined();
      expect(lessonQuiz.correctIndex).toBeUndefined();
      expect(lessonQuiz.question).toBe('What is O(1)?');
    });

    it('should throw NotFoundException if course not found', async () => {
      vi.spyOn(prisma.course, 'findFirst').mockResolvedValue(null);

      await expect(service.findCourseById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLesson', () => {
    it('should strip correctIndex from quizMCQ for student users in getLesson', async () => {
      const studentUser: any = {
        id: 'student-1',
        globalRole: 'STUDENT',
        memberships: [{ institutionId: 'institution-1', role: 'STUDENT' }],
      };

      vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue({
        id: 'l-1',
        title: 'Lesson 1',
        quizMCQ: {
          question: 'What is O(1)?',
          options: ['Constant', 'Linear'],
          correctIndex: 0,
        },
        module: {
          course: {
            id: 'course-1',
            title: 'DSA',
            status: CourseStatus.PUBLISHED,
            createdById: 'faculty-1',
            institutionId: 'institution-1',
          },
        },
      } as any);
      vi.spyOn(prisma.enrollment, 'findUnique').mockResolvedValue({
        status: 'ACTIVE',
      } as any);
      vi.spyOn(prisma.lessonProgress, 'findUnique').mockResolvedValue(null);

      const result = await service.getLesson('l-1', studentUser);
      const resultQuiz = result.quizMCQ as any;
      expect(resultQuiz).toBeDefined();
      expect(resultQuiz.correctIndex).toBeUndefined();
      expect(resultQuiz.question).toBe('What is O(1)?');
    });
  });

  describe('submitQuiz', () => {
    it('should return correct verification result when selected option matches', async () => {
      vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue({
        id: 'lesson-1',
        quizMCQ: {
          question: 'What is O(1)?',
          options: ['Constant', 'Linear'],
          correctIndex: 0,
        },
        module: {
          course: mockCourse,
        },
      } as any);
      vi.spyOn(prisma.lessonProgress, 'upsert').mockResolvedValue({} as any);

      const result = await service.submitQuiz('lesson-1', mockUser, 0);
      expect(result.isCorrect).toBe(true);
      expect(result.correctIndex).toBe(0);
      expect(result.quizAttempt.correctIndex).toBe(0);
    });

    it('should omit correctIndex when selected option is incorrect', async () => {
      vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue({
        id: 'lesson-1',
        quizMCQ: {
          question: 'What is O(1)?',
          options: ['Constant', 'Linear'],
          correctIndex: 0,
        },
        module: {
          course: mockCourse,
        },
      } as any);
      const upsertSpy = vi.spyOn(prisma.lessonProgress, 'upsert').mockResolvedValue({} as any);

      const result = await service.submitQuiz('lesson-1', mockUser, 1);
      expect(result.isCorrect).toBe(false);
      expect(result.correctIndex).toBeUndefined();
      expect(result.quizAttempt.correctIndex).toBeUndefined();
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            completed: false,
            quizAttempt: expect.objectContaining({ isCorrect: false }),
          }),
        }),
      );
    });
  });
});
