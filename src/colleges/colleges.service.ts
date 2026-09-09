import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CollegeStatus, Prisma } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateCollegeDto } from './dto/create-college.dto.js';
import { UpdateCollegeDto } from './dto/update-college.dto.js';

@Injectable()
export class CollegesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCollegeDto) {
    const existing = await this.prisma.college.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`College with code ${dto.code} already exists`);
    }

    return this.prisma.college.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        status: dto.status,
      },
      include: {
        _count: {
          select: {
            memberships: true,
            batches: true,
            courses: true,
            problems: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.college.findMany({
      include: {
        _count: {
          select: {
            memberships: true,
            batches: true,
            courses: true,
            problems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(args: PaginationArgs, status?: CollegeStatus) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CollegeWhereInput = {};

    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
        { address: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput = {};
    if (args.sortBy) {
      orderBy[args.sortBy as keyof Prisma.CollegeOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              memberships: true,
              batches: true,
              courses: true,
              problems: true,
            },
          },
        },
      }),
      this.prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const college = await this.prisma.college.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            batches: true,
            courses: true,
            problems: true,
            contests: true,
          },
        },
      },
    });

    if (!college) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }

    return college;
  }

  async update(id: string, dto: UpdateCollegeDto) {
    await this.findOne(id);

    return this.prisma.college.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: {
            memberships: true,
            batches: true,
            courses: true,
            problems: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.college.delete({
      where: { id },
    });

    return true;
  }

  async addMember(collegeId: string, dto: AddMemberDto) {
    await this.findOne(collegeId);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    return this.prisma.collegeMembership.upsert({
      where: {
        userId_collegeId: {
          userId: dto.userId,
          collegeId,
        },
      },
      update: {
        role: dto.role,
      },
      create: {
        userId: dto.userId,
        collegeId,
        role: dto.role,
      },
      include: {
        user: {
          select: userSanitizedSelect,
        },
      },
    });
  }

  async removeMember(collegeId: string, userId: string) {
    await this.findOne(collegeId);

    const membership = await this.prisma.collegeMembership.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this college');
    }

    await this.prisma.collegeMembership.delete({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    return true;
  }

  async getMembers(collegeId: string) {
    await this.findOne(collegeId);

    return this.prisma.collegeMembership.findMany({
      where: { collegeId },
      include: {
        user: {
          select: userSanitizedSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
