import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionStatus, Prisma, Role } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateInstitutionDto } from './dto/create-institution.dto.js';
import { UpdateInstitutionDto } from './dto/update-institution.dto.js';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstitutionDto) {
    const existing = await this.prisma.institution.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Institution with code ${dto.code} already exists`);
    }

    return this.prisma.institution.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        tier: dto.tier,
        quota: dto.quota,
        status: dto.status,
      },
      include: {
        memberships: {
          select: { role: true },
        },
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
    return this.prisma.institution.findMany({
      include: {
        memberships: {
          select: { role: true },
        },
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

  async findPaginated(args: PaginationArgs, status?: InstitutionStatus) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InstitutionWhereInput = {};

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

    const orderBy: Prisma.InstitutionOrderByWithRelationInput = {};
    if (args.sortBy && ['name', 'code', 'status', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
      orderBy[args.sortBy as keyof Prisma.InstitutionOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.institution.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          memberships: {
            select: { role: true },
          },
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
      this.prisma.institution.count({ where }),
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
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: userSanitizedSelect,
            },
          },
        },
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

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    return institution;
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);

    return this.prisma.institution.update({
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

    await this.prisma.institution.delete({
      where: { id },
    });

    return true;
  }

  async addMember(institutionId: string, dto: AddMemberDto, allowedTargetRole?: Role) {
    await this.findOne(institutionId);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    if (allowedTargetRole && dto.role !== allowedTargetRole) {
      throw new ForbiddenException(`Faculty can only assign ${allowedTargetRole.toLowerCase()} role`);
    }

    return this.prisma.$transaction(async (tx) => {
      const existingMembership = await tx.institutionMembership.findUnique({
        where: {
          userId_institutionId: {
            userId: dto.userId,
            institutionId,
          },
        },
      });

      if (allowedTargetRole && existingMembership && existingMembership.role !== allowedTargetRole) {
        throw new ForbiddenException('Faculty can only manage student memberships');
      }

      return tx.institutionMembership.upsert({
        where: {
          userId_institutionId: {
            userId: dto.userId,
            institutionId,
          },
        },
        update: {
          role: dto.role,
        },
        create: {
          userId: dto.userId,
          institutionId,
          role: dto.role,
        },
        include: {
          user: {
            select: userSanitizedSelect,
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async removeMember(institutionId: string, userId: string, allowedRole?: Role) {
    await this.findOne(institutionId);

    const membership = await this.prisma.institutionMembership.findUnique({
      where: {
        userId_institutionId: {
          userId,
          institutionId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this institution');
    }

    if (allowedRole && membership.role !== allowedRole) {
      throw new ForbiddenException(`Faculty can only remove ${allowedRole.toLowerCase()} members`);
    }

    return this.prisma.$transaction(async (tx) => {
      const institutionBatches = await tx.batch.findMany({
        where: { institutionId },
        select: { id: true },
      });
      const batchIds = institutionBatches.map((b) => b.id);

      if (batchIds.length > 0) {
        await tx.batchStudent.deleteMany({
          where: {
            userId,
            batchId: { in: batchIds },
          },
        });
      }

      const deleted = await tx.institutionMembership.deleteMany({
        where: {
          userId,
          institutionId,
          ...(allowedRole ? { role: allowedRole } : {}),
        },
      });

      if (deleted.count === 0) {
        throw new ForbiddenException(`Faculty can only remove ${allowedRole ? allowedRole.toLowerCase() : 'permitted'} members`);
      }

      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async getMembers(institutionId: string) {
    await this.findOne(institutionId);

    return this.prisma.institutionMembership.findMany({
      where: { institutionId },
      include: {
        user: {
          select: userSanitizedSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMember(institutionId: string, userId: string) {
    return this.prisma.institutionMembership.findUnique({
      where: {
        userId_institutionId: {
          userId,
          institutionId,
        },
      },
    });
  }
}
