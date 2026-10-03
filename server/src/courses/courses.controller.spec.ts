import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockUser: any = {
    id: 'user-faculty-1',
    email: 'faculty@example.com',
    name: 'Faculty Member',
    globalRole: Role.FACULTY,
    memberships: [],
  };

  const mockCourse = {
    id: 'course-1',
    title: 'DSA in C++',
    description: 'Master Data Structures',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            createCourse: vi.fn().mockResolvedValue(mockCourse),
            createCompositeCourse: vi.fn().mockResolvedValue(mockCourse),
            findAll: vi.fn().mockResolvedValue([mockCourse]),
            findCourseById: vi.fn().mockResolvedValue(mockCourse),
            updateCourse: vi.fn().mockResolvedValue(mockCourse),
            deleteCourse: vi.fn().mockResolvedValue(mockCourse),
            publishCourse: vi.fn().mockResolvedValue({ ...mockCourse, status: 'PUBLISHED' }),
            unpublishCourse: vi.fn().mockResolvedValue({ ...mockCourse, status: 'DRAFT' }),
            getEnrolledCourses: vi.fn().mockResolvedValue([]),
            enrollStudent: vi.fn().mockResolvedValue({ id: 'enr-1' }),
            unenrollStudent: vi.fn().mockResolvedValue({ id: 'enr-1', status: 'DROPPED' }),
            enrollBatchStudents: vi.fn().mockResolvedValue({ totalBatchStudents: 5, enrolledCount: 5 }),
            getCourseRoster: vi.fn().mockResolvedValue({ items: [], meta: { total: 0 } }),
            exportCourseRosterCsv: vi.fn().mockResolvedValue('"Student Name","Email"\n"John","john@edu.com"'),
            getLesson: vi.fn().mockResolvedValue({ id: 'les-1', title: 'Lesson 1' }),
            updateLessonProgress: vi.fn().mockResolvedValue({ completed: true }),
            submitQuiz: vi.fn().mockResolvedValue({ isCorrect: true }),
            getCourseProgress: vi.fn().mockResolvedValue({ totalLessons: 10, completedLessons: 5, progressPercent: 50 }),
            reorderModules: vi.fn().mockResolvedValue([]),
            reorderLessons: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a course', async () => {
    const dto = { title: 'DSA in C++' };
    const result = await controller.create(mockUser, dto);
    expect(result).toEqual(mockCourse);
    expect(service.createCourse).toHaveBeenCalledWith(mockUser.id, dto, mockUser);
  });

  it('should create a composite course', async () => {
    const dto = {
      title: 'Full Stack Systems',
      modules: [{ title: 'Module 1', lessons: [{ title: 'Lesson 1' }] }],
    };
    const result = await controller.createComposite(mockUser, dto as any);
    expect(result).toEqual(mockCourse);
    expect(service.createCompositeCourse).toHaveBeenCalledWith(mockUser.id, dto, mockUser);
  });

  it('should publish and unpublish course', async () => {
    const pubResult = await controller.publish('course-1', mockUser);
    expect(pubResult.status).toBe('PUBLISHED');

    const unpubResult = await controller.unpublish('course-1', mockUser);
    expect(unpubResult.status).toBe('DRAFT');
  });

  it('should get course roster gradebook', async () => {
    const query = { page: 1, limit: 20 };
    const result = await controller.getRoster('course-1', query, mockUser);
    expect(result).toHaveProperty('items');
    expect(service.getCourseRoster).toHaveBeenCalledWith('course-1', query, mockUser);
  });

  it('should export course roster CSV', async () => {
    const mockRes = {
      setHeader: vi.fn(),
    } as any;
    const csv = await controller.exportRosterCsv('course-1', mockUser, mockRes);
    expect(csv).toContain('Student Name');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
  });
});
