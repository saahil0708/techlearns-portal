var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
let BatchesService = class BatchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const institutionId = dto.institutionId || dto.collegeId;
        if (!institutionId) {
            throw new NotFoundException('Institution ID is required');
        }
        const institution = await this.prisma.institution.findUnique({
            where: { id: institutionId },
        });
        if (!institution) {
            throw new NotFoundException(`Institution with ID ${institutionId} not found`);
        }
        return this.prisma.batch.create({
            data: {
                name: dto.name,
                institutionId,
                maxCapacity: dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : 100,
                status: dto.status || 'ACTIVE',
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
            include: {
                institution: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { students: true },
                },
            },
        });
    }
    async findByInstitution(institutionId) {
        return this.prisma.batch.findMany({
            where: { institutionId },
            include: {
                institution: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { students: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByCollege(collegeId) {
        return this.findByInstitution(collegeId);
    }
    async findPaginated(args, institutionId) {
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(100, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;
        const where = {};
        if (institutionId) {
            where.institutionId = institutionId;
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
                    ? { [args.sortBy]: args.sortOrder?.toLowerCase() || 'desc' }
                    : { createdAt: 'desc' },
                include: {
                    institution: {
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
    async findOne(id) {
        const batch = await this.prisma.batch.findUnique({
            where: { id },
            include: {
                institution: {
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
    async update(id, dto) {
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
                institution: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { students: true },
                },
            },
        });
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.batch.delete({
            where: { id },
        });
    }
    async assignStudents(batchId, studentsOrIds) {
        const batch = await this.findOne(batchId);
        const assignmentsList = Array.isArray(studentsOrIds)
            ? studentsOrIds.map((item) => (typeof item === 'string' ? { userId: item } : item))
            : [];
        const uniqueAssignmentsMap = new Map();
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
                memberships: { where: { institutionId: batch.institutionId }, select: { id: true } },
            },
        });
        if (users.length !== uniqueUserIds.length || users.some((user) => user.memberships.length === 0)) {
            throw new ForbiddenException('All assigned students must belong to the batch institution');
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
    async removeStudent(batchId, userId) {
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
    async getStudents(batchId) {
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
    async getStudentsPaginated(batchId, args) {
        await this.findOne(batchId);
        const page = Math.max(1, args.page || 1);
        const limit = Math.min(100, Math.max(1, args.limit || 10));
        const skip = (page - 1) * limit;
        const where = { batchId };
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
};
BatchesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], BatchesService);
export { BatchesService };
//# sourceMappingURL=batches.service.js.map