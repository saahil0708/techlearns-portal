import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockUser = {
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
            findAll: vi.fn().mockResolvedValue([mockCourse]),
            findCourseById: vi.fn().mockResolvedValue(mockCourse),
            updateCourse: vi.fn().mockResolvedValue(mockCourse),
            deleteCourse: vi.fn().mockResolvedValue(mockCourse),
            getEnrolledCourses: vi.fn().mockResolvedValue([]),
            enrollStudent: vi.fn().mockResolvedValue({ id: 'enr-1' }),
            getLesson: vi.fn().mockResolvedValue({ id: 'les-1', title: 'Lesson 1' }),
            updateLessonProgress: vi.fn().mockResolvedValue({ completed: true }),
            getCourseProgress: vi.fn().mockResolvedValue({ totalLessons: 10, completedLessons: 5, progressPercent: 50 }),
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
    expect(service.createCourse).toHaveBeenCalledWith(mockUser.id, dto);
  });

  it('should list all courses', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockCourse]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get course by id', async () => {
    const result = await controller.findOne('course-1');
    expect(result).toEqual(mockCourse);
    expect(service.findCourseById).toHaveBeenCalledWith('course-1');
  });

  it('should enroll in a course', async () => {
    const result = await controller.enroll('course-1', mockUser);
    expect(result).toEqual({ id: 'enr-1' });
    expect(service.enrollStudent).toHaveBeenCalledWith('course-1', mockUser.id);
  });
});
