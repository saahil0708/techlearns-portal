import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import {
  CreateCommunityPostDto,
  CreateCommunityReplyDto,
} from './dto/create-community-post.dto.js';
import { QueryCommunityDto } from './dto/query-community.dto.js';
import { Role } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(
    userId: string,
    dto: CreateCommunityPostDto,
    currentUser: CurrentUserPayload,
  ) {
    const institutionId = currentUser.memberships?.[0]?.institutionId ?? null;
    return this.prisma.communityPost.create({
      data: {
        title: dto.title,
        channel: dto.channel ?? 'General',
        content: dto.content,
        tags: dto.tags ?? [],
        authorId: userId,
        institutionId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryCommunityDto, currentUser?: CurrentUserPayload) {
    const { search, channel, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (channel && channel !== 'All Channels') {
      where.channel = channel;
    }

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      });
    }

    const isGlobalSuperAdmin = currentUser?.globalRole === Role.SUPER_ADMIN;
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
      this.prisma.communityPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser?: CurrentUserPayload) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) throw new NotFoundException('Community discussion post not found');
    if (currentUser) {
      this.verifyPostVisibility(post, currentUser);
    }
    return post;
  }

  async deletePost(id: string, currentUser: CurrentUserPayload) {
    const post = await this.prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

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
      throw new ForbiddenException('Not authorized to delete this post');
    }

    await this.prisma.communityPost.delete({ where: { id } });
    return { success: true, message: 'Post deleted successfully' };
  }

  private verifyPostVisibility(
    post: { institutionId: string | null },
    currentUser?: CurrentUserPayload,
  ) {
    if (!currentUser || currentUser.globalRole === Role.SUPER_ADMIN) return;
    if (post.institutionId === null) return;
    const hasMatchingMembership = currentUser.memberships?.some(
      (m) => m.institutionId === post.institutionId,
    );
    if (!hasMatchingMembership) {
      throw new ForbiddenException('Post is not visible in your institution');
    }
  }

  async upvotePost(id: string, currentUser?: CurrentUserPayload) {
    const post = await this.prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Community post not found');

    if (currentUser) {
      this.verifyPostVisibility(post, currentUser);
    }

    try {
      return await this.prisma.communityPost.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new NotFoundException('Community post not found');
      }
      throw err;
    }
  }

  async addReply(
    postId: string,
    userId: string,
    dto: CreateCommunityReplyDto,
    currentUser?: CurrentUserPayload,
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Community post not found');

    if (currentUser) {
      this.verifyPostVisibility(post, currentUser);
    }

    return this.prisma.$transaction(async (tx) => {
      const reply = await tx.communityReply.create({
        data: {
          postId,
          authorId: userId,
          content: dto.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      await tx.communityPost.update({
        where: { id: postId },
        data: { repliesCount: { increment: 1 } },
      });

      return reply;
    });
  }

  async upvoteReply(
    postId: string,
    replyId: string,
    currentUser?: CurrentUserPayload,
  ) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Community post not found');

    if (currentUser) {
      this.verifyPostVisibility(post, currentUser);
    }

    const reply = await this.prisma.communityReply.findFirst({
      where: { id: replyId, postId },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found for this post');
    }

    return this.prisma.communityReply.update({
      where: { id: replyId },
      data: { upvotes: { increment: 1 } },
    });
  }
}
