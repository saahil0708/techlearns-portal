import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProblemsService } from './problems.service.js';

describe('ProblemsService', () => {
  let service: ProblemsService;
  let prisma: PrismaService;

  const mockProblem = {
    id: 'prob-1',
    title: 'Two Sum',
    slug: 'two-sum',
    statement: 'Find two indices that sum up to target',
    inputFormat: 'Array and target',
    outputFormat: 'Indices',
    constraints: 'N <= 10^5',
    difficulty: ProblemDifficulty.EASY,
    timeLimit: 1000,
    memoryLimit: 256,
    institutionId: null,
    createdById: 'user-1',
    status: ProblemStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
    testCases: [
      { id: 'tc-1', problemId: 'prob-1', input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, order: 0 },
    ],
    _count: { submissions: 10, testCases: 1 },
  };

  beforeEach(() => {
    prisma = {
      $transaction: vi.fn((cb) => (typeof cb === 'function' ? cb(prisma) : Promise.all(cb))),
      problem: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      testCase: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      course: {
        findUnique: vi.fn(),
      },
      module: {
        findUnique: vi.fn(),
      },
      lesson: {
        findUnique: vi.fn(),
      },
      courseProblem: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
      submission: {
        count: vi.fn().mockResolvedValue(4),
      },
    } as unknown as PrismaService;

    service = new ProblemsService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a problem with slug generation', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.problem.create).mockResolvedValue(mockProblem as any);

      const result = await service.create(
        {
          title: 'Two Sum',
          statement: 'Find two indices',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          difficulty: ProblemDifficulty.EASY,
          timeLimit: 1000,
          memoryLimit: 256,
        },
        'user-1',
      );

      expect(result).toEqual(mockProblem);
      expect(prisma.problem.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate slug', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(mockProblem as any);

      await expect(
        service.create(
          {
            title: 'Two Sum',
            statement: 'Find two indices',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            difficulty: ProblemDifficulty.EASY,
            timeLimit: 1000,
            memoryLimit: 256,
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject global problem linked to institution course', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: 'inst-1',
        createdById: 'user-1',
      } as any);

      await expect(
        service.create(
          {
            title: 'Two Sum',
            statement: 'Find two indices',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            difficulty: ProblemDifficulty.EASY,
            timeLimit: 1000,
            memoryLimit: 256,
            courseId: 'c-1',
          },
          'user-1',
          { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
        ),
      ).rejects.toThrow(/global problem cannot be linked to an institution-scoped course/);
    });

    it('should reject module that does not belong to course', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: null,
        createdById: 'user-1',
      } as any);
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'mod-1',
        courseId: 'different-course',
      } as any);

      await expect(
        service.create(
          {
            title: 'Two Sum',
            statement: 'Find two indices',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            difficulty: ProblemDifficulty.EASY,
            timeLimit: 1000,
            memoryLimit: 256,
            courseId: 'c-1',
            moduleId: 'mod-1',
          },
          'user-1',
          { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
        ),
      ).rejects.toThrow(/does not belong to course/);
    });
  });

  describe('update', () => {
    it('should update problem and exclude moduleId/lessonId from Prisma problem update', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue(mockProblem as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: null,
        createdById: 'user-1',
      } as any);
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'mod-1',
        courseId: 'c-1',
      } as any);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
        id: 'les-1',
        moduleId: 'mod-1',
        module: { courseId: 'c-1' },
      } as any);
      vi.mocked(prisma.problem.update).mockResolvedValue({
        ...mockProblem,
        title: 'Updated Two Sum',
      } as any);
      const mockMappings = [
        { courseId: 'c-1', problemId: 'prob-1', moduleId: 'mod-1', lessonId: 'les-1', points: 100 },
      ];
      vi.mocked(prisma.courseProblem.findMany).mockResolvedValue(mockMappings as any);

      const result = await service.update(
        'prob-1',
        {
          title: 'Updated Two Sum',
          courseId: 'c-1',
          moduleId: 'mod-1',
          lessonId: 'les-1',
        },
        { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
      );

      expect(result.title).toBe('Updated Two Sum');
      expect(result.courseMappings).toEqual(mockMappings);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.problem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            moduleId: expect.anything(),
          }),
        }),
      );
      expect(prisma.problem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            lessonId: expect.anything(),
          }),
        }),
      );
      expect(prisma.courseProblem.upsert).toHaveBeenCalled();
      expect(prisma.courseProblem.findMany).toHaveBeenCalledWith({
        where: { problemId: 'prob-1' },
      });
    });

    it('should revalidate targetCourseId and existing mapping when institutionId changes', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-1',
        institutionId: 'inst-1',
        courseMappings: [
          { courseId: 'c-1', problemId: 'prob-1', moduleId: 'mod-1', lessonId: 'les-1' },
        ],
      } as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: 'inst-1',
        createdById: 'user-1',
      } as any);

      await expect(
        service.update(
          'prob-1',
          {
            institutionId: 'different-inst',
          },
          {
            id: 'user-1',
            globalRole: 'SUPER_ADMIN',
            memberships: [{ institutionId: 'different-inst', role: 'INSTITUTION_ADMIN' }],
          } as any,
        ),
      ).rejects.toThrow(/Course belongs to a different institution than the problem/);
    });

    it('should clear stored moduleId and lessonId when courseId changes without replacements', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-1',
        institutionId: null,
        courseMappings: [
          { courseId: 'c-1', problemId: 'prob-1', moduleId: 'mod-1', lessonId: 'les-1' },
        ],
      } as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-2',
        institutionId: null,
        createdById: 'user-1',
      } as any);
      vi.mocked(prisma.problem.update).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-2',
      } as any);
      vi.mocked(prisma.courseProblem.findMany).mockResolvedValue([]);

      await service.update(
        'prob-1',
        {
          courseId: 'c-2',
        },
        { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
      );

      expect(prisma.courseProblem.deleteMany).toHaveBeenCalledWith({
        where: { problemId: 'prob-1', courseId: { not: 'c-2' } },
      });
      expect(prisma.courseProblem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            courseId: 'c-2',
            moduleId: null,
            lessonId: null,
          }),
          update: expect.objectContaining({
            moduleId: null,
            lessonId: null,
          }),
        }),
      );
    });

    it('should clean up other course mappings when course changes from null', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue({
        ...mockProblem,
        courseId: null,
        institutionId: null,
        courseMappings: [],
      } as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: null,
        createdById: 'user-1',
      } as any);
      vi.mocked(prisma.problem.update).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-1',
      } as any);
      vi.mocked(prisma.courseProblem.findMany).mockResolvedValue([]);

      await service.update(
        'prob-1',
        {
          courseId: 'c-1',
        },
        { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
      );

      expect(prisma.courseProblem.deleteMany).toHaveBeenCalledWith({
        where: { problemId: 'prob-1', courseId: { not: 'c-1' } },
      });
    });

    it('should derive moduleId from lesson.moduleId when omitted during update', async () => {
      vi.mocked(prisma.problem.findUnique).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-1',
        institutionId: null,
        courseMappings: [],
      } as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValue({
        id: 'c-1',
        institutionId: null,
        createdById: 'user-1',
      } as any);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
        id: 'les-1',
        moduleId: 'mod-from-lesson',
        module: { id: 'mod-from-lesson', courseId: 'c-1' },
      } as any);
      vi.mocked(prisma.problem.update).mockResolvedValue({
        ...mockProblem,
        courseId: 'c-1',
      } as any);
      vi.mocked(prisma.courseProblem.findMany).mockResolvedValue([]);

      await service.update(
        'prob-1',
        {
          courseId: 'c-1',
          lessonId: 'les-1',
        },
        { id: 'user-1', globalRole: 'SUPER_ADMIN', memberships: [] } as any,
      );

      expect(prisma.courseProblem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            courseId: 'c-1',
            moduleId: 'mod-from-lesson',
            lessonId: 'les-1',
          }),
          update: expect.objectContaining({
            moduleId: 'mod-from-lesson',
            lessonId: 'les-1',
          }),
        }),
      );
    });
  });

  describe('findByIdOrSlug', () => {
    it('should return a problem when found', async () => {
      vi.mocked(prisma.problem.findFirst).mockResolvedValue(mockProblem as any);
      vi.mocked(prisma.testCase.findMany).mockResolvedValue(mockProblem.testCases as any);

      const result = await service.findByIdOrSlug('two-sum');
      expect(result).toMatchObject({
        ...mockProblem,
        points: 100,
        totalSubmissions: 10,
        acceptedSubmissions: 4,
        acceptanceRate: 40,
      });
    });

    it('should throw NotFoundException if problem does not exist', async () => {
      vi.mocked(prisma.problem.findFirst).mockResolvedValue(null);

      await expect(service.findByIdOrSlug('unknown-problem')).rejects.toThrow(NotFoundException);
    });
  });
});
