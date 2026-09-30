import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';

describe('BlogsService', () => {
  let service: BlogsService;

  const mockPrismaService = {
    blogPost: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    blogComment: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrismaService)),
    $executeRawUnsafe: vi.fn(),
    $queryRawUnsafe: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a blog post', async () => {
    mockPrismaService.blogPost.create.mockResolvedValue({
      id: 'blog-1',
      title: 'Redis Leaderboard',
      slug: 'redis-leaderboard-123',
    });

    const result = await service.createBlog(
      'user-1',
      {
        title: 'Redis Leaderboard',
        content: 'Content here',
      },
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Tester',
        globalRole: Role.STUDENT,
        memberships: [],
      },
    );

    expect(result.id).toBe('blog-1');
    expect(mockPrismaService.blogPost.create).toHaveBeenCalled();
  });

  it('should return paginated blogs list', async () => {
    mockPrismaService.blogPost.findMany.mockResolvedValue([
      {
        id: 'blog-1',
        title: 'Redis Leaderboard',
        _count: { comments: 3 },
      },
    ]);
    mockPrismaService.blogPost.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].commentsCount).toBe(3);
    expect(result.total).toBe(1);
  });

  it('should increment claps on blog post', async () => {
    mockPrismaService.blogPost.update.mockResolvedValue({
      id: 'blog-1',
      claps: 10,
    });

    const result = await service.clapBlog('blog-1');
    expect(result.claps).toBe(10);
  });
});
