import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';

describe('CommunityService', () => {
  let service: CommunityService;

  const mockPrismaService = {
    communityPost: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    communityReply: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a community post', async () => {
    mockPrismaService.communityPost.create.mockResolvedValue({
      id: 'post-1',
      title: 'Interview Experience',
      channel: 'Interview Experiences',
    });

    const result = await service.createPost(
      'user-1',
      {
        title: 'Interview Experience',
        channel: 'Interview Experiences',
        content: 'Passed Google SDE-2 interview',
      },
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Tester',
        globalRole: Role.STUDENT,
        memberships: [],
      },
    );

    expect(result.id).toBe('post-1');
    expect(mockPrismaService.communityPost.create).toHaveBeenCalled();
  });

  it('should upvote a post', async () => {
    mockPrismaService.communityPost.findUnique.mockResolvedValue({
      id: 'post-1',
      institutionId: null,
    });
    mockPrismaService.communityPost.update.mockResolvedValue({
      id: 'post-1',
      upvotes: 5,
    });

    const result = await service.upvotePost('post-1');
    expect(result.upvotes).toBe(5);
  });
});
