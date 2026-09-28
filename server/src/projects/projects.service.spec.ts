import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockPrismaService = {
    studentProject: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectMilestone: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a student project sandbox', async () => {
    mockPrismaService.studentProject.create.mockResolvedValue({
      id: 'proj-1',
      title: 'Raft KV Store',
      progressPct: 0,
    });

    const result = await service.createProject(
      'user-1',
      {
        title: 'Raft KV Store',
        description: 'Raft consensus key value store',
      },
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Tester',
        globalRole: Role.STUDENT,
        memberships: [],
      },
    );

    expect(result.id).toBe('proj-1');
    expect(mockPrismaService.studentProject.create).toHaveBeenCalled();
  });

  it('should find all student projects with pagination', async () => {
    mockPrismaService.studentProject.findMany.mockResolvedValue([
      { id: 'proj-1', title: 'Raft KV' },
    ]);
    mockPrismaService.studentProject.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
