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
import { ProblemStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
let ProblemsService = class ProblemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    slugify(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async create(input, creatorId, user) {
        const institutionId = input.institutionId || input.collegeId;
        this.assertInstitutionAssignment(institutionId, user);
        const slug = input.slug || this.slugify(input.title);
        const existing = await this.prisma.problem.findUnique({
            where: { slug },
        });
        if (existing) {
            throw new ConflictException(`Problem with slug "${slug}" already exists`);
        }
        return this.prisma.problem.create({
            data: {
                title: input.title,
                slug,
                statement: input.statement,
                inputFormat: input.inputFormat,
                outputFormat: input.outputFormat,
                constraints: input.constraints,
                difficulty: input.difficulty,
                timeLimit: input.timeLimit,
                memoryLimit: input.memoryLimit,
                institutionId,
                createdById: creatorId,
                status: input.status || ProblemStatus.PUBLISHED,
                testCases: input.testCases
                    ? {
                        create: input.testCases.map((tc, index) => ({
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            isHidden: tc.isHidden !== undefined ? tc.isHidden : true,
                            explanation: tc.explanation,
                            order: tc.order ?? index,
                        })),
                    }
                    : undefined,
            },
            include: {
                testCases: true,
                _count: {
                    select: {
                        submissions: true,
                        testCases: true,
                    },
                },
            },
        });
    }
    async findPaginated(args, difficulty, status, institutionId, user) {
        const page = args.page || 1;
        const limit = args.limit || 10;
        const skip = (page - 1) * limit;
        const targetInstId = institutionId;
        const where = {};
        if (args.search) {
            where.OR = [
                { title: { contains: args.search, mode: 'insensitive' } },
                { slug: { contains: args.search, mode: 'insensitive' } },
                { statement: { contains: args.search, mode: 'insensitive' } },
            ];
        }
        if (difficulty) {
            where.difficulty = difficulty;
        }
        const isSuperAdmin = user?.globalRole === Role.SUPER_ADMIN ||
            user?.globalRole === Role.PLATFORM_ADMIN;
        if (!isSuperAdmin) {
            where.status = ProblemStatus.PUBLISHED;
            const userInstitutionIds = user?.memberships?.map((m) => m.institutionId) || [];
            if (targetInstId) {
                if (!userInstitutionIds.includes(targetInstId)) {
                    where.institutionId = '__unauthorized_institution__';
                }
                else {
                    where.institutionId = targetInstId;
                }
            }
            else {
                const visibilityConditions = [
                    { institutionId: null },
                    ...(userInstitutionIds.length > 0 ? [{ institutionId: { in: userInstitutionIds } }] : []),
                ];
                if (where.OR) {
                    where.AND = [{ OR: where.OR }, { OR: visibilityConditions }];
                    delete where.OR;
                }
                else {
                    where.OR = visibilityConditions;
                }
            }
        }
        else {
            if (status) {
                where.status = status;
            }
            if (targetInstId) {
                where.institutionId = targetInstId;
            }
        }
        const orderBy = {};
        if (args.sortBy && ['title', 'slug', 'difficulty', 'status', 'timeLimit', 'memoryLimit', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
            orderBy[args.sortBy] =
                args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [items, total] = await Promise.all([
            this.prisma.problem.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    testCases: {
                        where: isSuperAdmin ? {} : { isHidden: false },
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            submissions: true,
                            testCases: true,
                        },
                    },
                },
            }),
            this.prisma.problem.count({ where }),
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
    async findByIdOrSlug(idOrSlug, user) {
        const isSuperAdmin = user?.globalRole === Role.SUPER_ADMIN ||
            user?.globalRole === Role.PLATFORM_ADMIN;
        const problem = await this.prisma.problem.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
            include: {
                _count: {
                    select: {
                        submissions: true,
                        testCases: true,
                    },
                },
            },
        });
        if (!problem) {
            throw new NotFoundException(`Problem ${idOrSlug} not found`);
        }
        const isOwner = user && problem.createdById === user.id;
        const isInstitutionStaff = user &&
            problem.institutionId &&
            user.memberships?.some((m) => m.institutionId === problem.institutionId &&
                (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN));
        const hasPrivilegedAccess = isSuperAdmin || isOwner || isInstitutionStaff;
        if (!hasPrivilegedAccess) {
            if (problem.status !== ProblemStatus.PUBLISHED) {
                throw new NotFoundException(`Problem ${idOrSlug} not found`);
            }
            if (problem.institutionId) {
                const isMember = user?.memberships?.some((m) => m.institutionId === problem.institutionId);
                if (!isMember) {
                    throw new NotFoundException(`Problem ${idOrSlug} not found`);
                }
            }
        }
        const testCases = await this.prisma.testCase.findMany({
            where: {
                problemId: problem.id,
                ...(hasPrivilegedAccess ? {} : { isHidden: false }),
            },
            orderBy: { order: 'asc' },
        });
        return {
            ...problem,
            testCases,
        };
    }
    async update(id, input, user) {
        const existing = await this.prisma.problem.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Problem with ID ${id} not found`);
        }
        this.assertProblemAuthorOrAdmin(existing, user);
        return this.prisma.problem.update({
            where: { id },
            data: input,
            include: {
                testCases: true,
                _count: {
                    select: {
                        submissions: true,
                        testCases: true,
                    },
                },
            },
        });
    }
    async delete(id, user) {
        const existing = await this.prisma.problem.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Problem with ID ${id} not found`);
        }
        this.assertProblemAuthorOrAdmin(existing, user);
        await this.prisma.problem.delete({
            where: { id },
        });
        return true;
    }
    async addTestCase(problemId, input, user) {
        const problem = await this.prisma.problem.findUnique({
            where: { id: problemId },
        });
        if (!problem) {
            throw new NotFoundException(`Problem with ID ${problemId} not found`);
        }
        this.assertProblemAuthorOrAdmin(problem, user);
        return this.prisma.testCase.create({
            data: {
                problemId,
                input: input.input,
                expectedOutput: input.expectedOutput,
                isHidden: input.isHidden !== undefined ? input.isHidden : true,
                explanation: input.explanation,
                order: input.order ?? 0,
            },
        });
    }
    async getTestCases(problemId, user) {
        const problem = await this.prisma.problem.findUnique({
            where: { id: problemId },
        });
        if (!problem) {
            throw new NotFoundException(`Problem with ID ${problemId} not found`);
        }
        const isSuperAdmin = Boolean(user &&
            (user.globalRole === Role.SUPER_ADMIN ||
                user.globalRole === Role.PLATFORM_ADMIN));
        const isOwner = Boolean(user && problem.createdById === user.id);
        const isInstitutionStaff = Boolean(user &&
            problem.institutionId &&
            user.memberships?.some((m) => m.institutionId === problem.institutionId &&
                (m.role === Role.FACULTY || m.role === Role.INSTITUTION_ADMIN)));
        const hasPrivilegedAccess = isSuperAdmin || isOwner || isInstitutionStaff;
        if (!hasPrivilegedAccess) {
            if (problem.status !== ProblemStatus.PUBLISHED) {
                throw new NotFoundException(`Problem with ID ${problemId} not found`);
            }
            if (problem.institutionId &&
                !user?.memberships?.some((membership) => membership.institutionId === problem.institutionId)) {
                throw new NotFoundException(`Problem with ID ${problemId} not found`);
            }
        }
        return this.prisma.testCase.findMany({
            where: {
                problemId,
                ...(hasPrivilegedAccess ? {} : { isHidden: false }),
            },
            orderBy: { order: 'asc' },
        });
    }
    assertProblemAuthorOrAdmin(problem, user) {
        if (!user) {
            throw new ForbiddenException('Authentication required');
        }
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        if (problem.createdById === user.id) {
            return;
        }
        if (problem.institutionId) {
            const isInstitutionAdmin = user.memberships?.some((m) => m.institutionId === problem.institutionId && m.role === Role.INSTITUTION_ADMIN);
            if (isInstitutionAdmin) {
                return;
            }
        }
        throw new ForbiddenException('You do not have permission to modify this problem');
    }
    assertInstitutionAssignment(institutionId, user) {
        if (!institutionId) {
            return;
        }
        if (!user) {
            throw new ForbiddenException('Authentication required');
        }
        if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
            return;
        }
        const canManageInstitution = user.memberships?.some((membership) => membership.institutionId === institutionId &&
            (membership.role === Role.INSTITUTION_ADMIN || membership.role === Role.FACULTY));
        if (!canManageInstitution) {
            throw new ForbiddenException('You can only create problems in your assigned institution');
        }
    }
};
ProblemsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ProblemsService);
export { ProblemsService };
//# sourceMappingURL=problems.service.js.map