import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';

export interface StudentAssignment {
  userId: string;
  rollNo?: string;
}

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBatchDto) {
    const college = await this.prisma.college.findUnique({
      where: { id: dto.collegeId },
    });

    if (!college) {
      throw new NotFoundException(`College with ID ${dto.collegeId} not found`);
    }

    return this.prisma.batch.create({
      data: {
        name: dto.name,
        collegeId: dto.collegeId,
        maxCapacity: dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : 100,
        status: dto.status || 'ACTIVE',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: {
        college: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async findByCollege(collegeId: string) {
    return this.prisma.batch.findMany({
      where: { collegeId },
      include: {
        college: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(args: PaginationArgs, collegeId?: string) {
    const page = Math.max(1, args.page || 1);
    const limit = Math.min(100, Math.max(1, args.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BatchWhereInput = {};
    if (collegeId) {
      where.collegeId = collegeId;
    }

    if (args.search?.trim()) {
      where.name = { contains: args.search.trim(), mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      this.prisma.batch.count({ where }),
      this.prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: args.sortBy
          ? { [args.sortBy]: (args.sortOrder?.toLowerCase() as 'asc' | 'desc') || 'desc' }
          : { createdAt: 'desc' },
        include: {
          college: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { students: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        college: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    await this.findOne(id);

    return this.prisma.batch.update({
      where: { id },
      data: {
        name: dto.name,
        maxCapacity: dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : undefined,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        college: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.batch.delete({
      where: { id },
    });
  }

  async assignStudents(
    batchId: string,
    studentsOrIds: string[] | StudentAssignment[],
  ) {
    const batch = await this.findOne(batchId);

    // Normalize input to StudentAssignment array
    const assignmentsList: StudentAssignment[] = Array.isArray(studentsOrIds)
      ? studentsOrIds.map((item) => (typeof item === 'string' ? { userId: item } : item))
      : [];

    const uniqueAssignmentsMap = new Map<string, StudentAssignment>();
    for (const assignment of assignmentsList) {
      if (assignment.userId && !uniqueAssignmentsMap.has(assignment.userId)) {
        uniqueAssignmentsMap.set(assignment.userId, assignment);
      }
    }

    const uniqueUserIds = Array.from(uniqueAssignmentsMap.keys());
    if (uniqueUserIds.length === 0) {
      return this.getStudents(batchId);
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: {
        id: true,
        memberships: { where: { collegeId: batch.collegeId }, select: { id: true } },
      },
    });

    if (users.length !== uniqueUserIds.length || users.some((user) => user.memberships.length === 0)) {
      throw new ForbiddenException('All assigned students must belong to the batch college');
    }

    const operations = uniqueUserIds.map((userId) => {
      const assignment = uniqueAssignmentsMap.get(userId);
      return this.prisma.batchStudent.upsert({
        where: {
          batchId_userId: {
            batchId,
            userId,
          },
        },
        update: assignment?.rollNo !== undefined ? { rollNo: assignment.rollNo } : {},
        create: {
          batchId,
          userId,
          rollNo: assignment?.rollNo ?? null,
        },
      });
    });

    await this.prisma.$transaction(operations);

    return this.getStudents(batchId);
  }

  async removeStudent(batchId: string, userId: string) {
    await this.findOne(batchId);

    const existing = await this.prisma.batchStudent.findUnique({
      where: {
        batchId_userId: {
          batchId,
          userId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Student is not enrolled in this batch');
    }

    return this.prisma.batchStudent.delete({
      where: {
        batchId_userId: {
          batchId,
          userId,
        },
      },
    });
  }

  async getStudents(batchId: string) {
    await this.findOne(batchId);

    return this.prisma.batchStudent.findMany({
      where: { batchId },
      include: {
        user: {
          select: userSanitizedSelect,
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getStudentsPaginated(batchId: string, args: PaginationArgs) {
    await this.findOne(batchId);

    const page = Math.max(1, args.page || 1);
    const limit = Math.min(100, Math.max(1, args.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BatchStudentWhereInput = { batchId };

    if (args.search?.trim()) {
      const term = args.search.trim();
      where.OR = [
        { rollNo: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
        { user: { phone: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.batchStudent.count({ where }),
      this.prisma.batchStudent.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: userSanitizedSelect,
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
