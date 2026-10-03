import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateBlogCommentDto, CreateBlogDto } from './dto/create-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { Role } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 7)
    );
  }

  async createBlog(
    userId: string,
    dto: CreateBlogDto,
    currentUser: CurrentUserPayload,
  ) {
    const slug = this.slugify(dto.title);
    const institutionId = currentUser.memberships?.[0]?.institutionId ?? null;
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        slug,
        category: dto.category ?? 'System Architecture',
        readTime: dto.readTime ?? '5 min read',
        coverImage: dto.coverImage,
        content: dto.content,
        tags: dto.tags ?? [],
        status: dto.status ?? 'Published',
        authorId: userId,
        institutionId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            globalRole: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryBlogDto, currentUser?: CurrentUserPayload) {
    const { search, category, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category && category !== 'All Stories') {
      where.category = category;
    }

    const isGlobalSuperAdmin = currentUser?.globalRole === Role.SUPER_ADMIN;
    const andConditions: any[] = [];

    // Status authorization
    if (!status || status === 'Published') {
      where.status = 'Published';
    } else if (isGlobalSuperAdmin) {
      where.status = status;
    } else if (currentUser) {
      const adminInstitutionIds =
        currentUser.memberships
          ?.filter((m) => m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN)
          ?.map((m) => m.institutionId)
          ?.filter((id): id is string => Boolean(id)) ?? [];

      where.status = status;
      andConditions.push({
        OR: [
          { authorId: currentUser.id },
          ...(adminInstitutionIds.length > 0 ? [{ institutionId: { in: adminInstitutionIds } }] : []),
        ],
      });
    } else {
      where.status = 'Published';
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (!isGlobalSuperAdmin) {
      const institutionIds =
        currentUser?.memberships
          ?.map((m) => m.institutionId)
          .filter((id): id is string => Boolean(id)) ?? [];

      if (institutionIds.length > 0) {
        andConditions.push({
          OR: [
            { institutionId: { in: institutionIds } },
            { institutionId: null },
          ],
        });
      } else {
        andConditions.push({
          institutionId: null,
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              globalRole: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        commentsCount: item._count.comments,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(idOrSlug: string, currentUser?: CurrentUserPayload) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            globalRole: true,
            avatarUrl: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                globalRole: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    const isGlobalSuperAdmin = currentUser?.globalRole === Role.SUPER_ADMIN;
    const isOwner = currentUser?.id === post.authorId;
    const isInstitutionAdmin =
      Boolean(post.institutionId) &&
      currentUser?.memberships?.some(
        (m) =>
          (m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN) &&
          m.institutionId === post.institutionId,
      );

    // Unpublished status check
    if (post.status !== 'Published') {
      if (!isGlobalSuperAdmin && !isOwner && !isInstitutionAdmin) {
        throw new NotFoundException('Blog post not found');
      }
    }

    // Institution isolation check
    if (post.institutionId && !isGlobalSuperAdmin) {
      const userInstitutionIds =
        currentUser?.memberships
          ?.map((m) => m.institutionId)
          .filter((id): id is string => Boolean(id)) ?? [];

      if (!userInstitutionIds.includes(post.institutionId) && !isOwner) {
        throw new NotFoundException('Blog post not found');
      }
    }

    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return post;
  }

  async updateBlog(
    id: string,
    dto: UpdateBlogDto,
    currentUser: CurrentUserPayload,
  ) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const isOwner = post.authorId === currentUser.id;
    const isGlobalSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN;
    const isInstitutionAdmin =
      Boolean(post.institutionId) &&
      currentUser.memberships?.some(
        (m) =>
          (m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN) &&
          m.institutionId === post.institutionId,
      );

    if (!isOwner && !isGlobalSuperAdmin && !isInstitutionAdmin) {
      throw new ForbiddenException('Not authorized to edit this blog post');
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            globalRole: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteBlog(id: string, currentUser: CurrentUserPayload) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const isOwner = post.authorId === currentUser.id;
    const isGlobalSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN;
    const isInstitutionAdmin =
      Boolean(post.institutionId) &&
      currentUser.memberships?.some(
        (m) =>
          (m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN) &&
          m.institutionId === post.institutionId,
      );

    if (!isOwner && !isGlobalSuperAdmin && !isInstitutionAdmin) {
      throw new ForbiddenException('Not authorized to delete this blog post');
    }

    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true, message: 'Blog post deleted successfully' };
  }

  async clapBlog(id: string, userId?: string) {
    const MAX_CLAPS = 10;

    return this.prisma.$transaction(async (tx) => {
      const post = await tx.blogPost.findUnique({ where: { id } });
      if (!post) {
        throw new NotFoundException('Blog post not found');
      }

      if (userId) {
        const affected = await tx.$executeRawUnsafe(
          `
          INSERT INTO blog_post_claps (id, "postId", "userId", count, "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, $1, $2, 1, NOW(), NOW())
          ON CONFLICT ("postId", "userId")
          DO UPDATE SET count = blog_post_claps.count + 1, "updatedAt" = NOW()
          WHERE blog_post_claps.count < $3
          `,
          id,
          userId,
          MAX_CLAPS,
        );

        if (affected === 0) {
          throw new BadRequestException('You have reached the maximum limit of 10 claps for this article');
        }
      }

      return tx.blogPost.update({
        where: { id },
        data: { claps: { increment: 1 } },
      });
    });
  }

  async addComment(
    postId: string,
    userId: string,
    dto: CreateBlogCommentDto,
  ) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Blog post not found');

    return this.prisma.blogComment.create({
      data: {
        postId,
        authorId: userId,
        text: dto.text,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            globalRole: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateComment(
    postId: string,
    commentId: string,
    userId: string,
    dto: CreateBlogCommentDto,
  ) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.postId !== postId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Not authorized to edit this comment');
    }

    return this.prisma.blogComment.update({
      where: { id: commentId },
      data: { text: dto.text },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            globalRole: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteComment(postId: string, commentId: string, userId: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.postId !== postId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    await this.prisma.blogComment.delete({ where: { id: commentId } });
    return { success: true, message: 'Comment deleted successfully' };
  }
}
