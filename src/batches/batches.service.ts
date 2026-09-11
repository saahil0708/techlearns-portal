import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';

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
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findByCollege(collegeId: string) {
    return this.prisma.batch.findMany({
      where: { collegeId },
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.batch.delete({
      where: { id },
    });
  }

  async assignStudents(batchId: string, userIds: string[]) {
    const batch = await this.findOne(batchId);
    const uniqueUserIds = [...new Set(userIds)];
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

    const assignments = uniqueUserIds.map((userId) =>
      this.prisma.batchStudent.upsert({
        where: {
          batchId_userId: {
            batchId,
            userId,
          },
        },
        update: {},
        create: {
          batchId,
          userId,
        },
      }),
    );

    await this.prisma.$transaction(assignments);

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
}
