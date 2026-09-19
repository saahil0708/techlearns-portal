var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
let InstitutionsService = class InstitutionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
    async findPaginated(args, status) {
        const page = args.page || 1;
        const limit = args.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
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
        const orderBy = {};
        if (args.sortBy && ['name', 'code', 'status', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
            orderBy[args.sortBy] =
                args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
        else {
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
    async findOne(id) {
        const [institution, pendingInvitations] = await Promise.all([
            this.prisma.institution.findUnique({
                where: { id },
                include: {
                    memberships: {
                        include: {
                            user: {
                                select: userSanitizedSelect,
                            },
                        },
                    },
                    batches: {
                        include: {
                            _count: {
                                select: { students: true },
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
            }),
            this.prisma.userInvitation.findMany({
                where: {
                    institutionId: id,
                    acceptedAt: null,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                },
                include: {
                    delivery: {
                        select: { status: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        if (!institution) {
            throw new NotFoundException(`Institution with ID ${id} not found`);
        }
        return {
            ...institution,
            pendingInvitations,
        };
    }
    async update(id, dto) {
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
    async delete(id, purgeUsers = false) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            if (purgeUsers) {
                const members = await tx.institutionMembership.findMany({
                    where: { institutionId: id },
                    select: {
                        userId: true,
                        user: {
                            select: { id: true, globalRole: true },
                        },
                    },
                });
                const candidateUserIds = [];
                for (const member of members) {
                    if (member.user &&
                        member.user.globalRole !== Role.SUPER_ADMIN &&
                        member.user.globalRole !== Role.PLATFORM_ADMIN) {
                        candidateUserIds.push(member.userId);
                    }
                }
                let userIdsToPurge = [];
                if (candidateUserIds.length > 0) {
                    const nonExclusiveMembers = await tx.institutionMembership.findMany({
                        where: {
                            userId: { in: candidateUserIds },
                            institutionId: { not: id },
                        },
                        select: {
                            userId: true,
                        },
                        distinct: ['userId'],
                    });
                    const nonExclusiveUserIds = new Set(nonExclusiveMembers.map((m) => m.userId));
                    userIdsToPurge = candidateUserIds.filter((userId) => !nonExclusiveUserIds.has(userId));
                }
                await tx.institution.delete({
                    where: { id },
                });
                if (userIdsToPurge.length > 0) {
                    await tx.user.deleteMany({
                        where: {
                            id: { in: userIdsToPurge },
                            globalRole: { notIn: [Role.SUPER_ADMIN, Role.PLATFORM_ADMIN] },
                            memberships: { none: {} },
                        },
                    });
                }
            }
            else {
                await tx.institution.delete({
                    where: { id },
                });
            }
            return true;
        }, {
            isolationLevel: 'Serializable',
        });
    }
    async addMember(institutionId, dto, allowedTargetRole) {
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
    async removeMember(institutionId, userId, allowedRole) {
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
    async getMembers(institutionId) {
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
    async getMember(institutionId, userId) {
        return this.prisma.institutionMembership.findUnique({
            where: {
                userId_institutionId: {
                    userId,
                    institutionId,
                },
            },
        });
    }
};
InstitutionsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], InstitutionsService);
export { InstitutionsService };
//# sourceMappingURL=institutions.service.js.map