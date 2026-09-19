var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubmissionsService_1;
import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { ContestStatus, SubmissionStatus, SubmissionVerdict, } from '@prisma/client';
import { Queue } from 'bullmq';
import { EVALUATE_SUBMISSION_JOB, JUDGE_QUEUE_NAME, } from '../judge/judge.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSanitizedSelect } from '../users/users.service.js';
let SubmissionsService = SubmissionsService_1 = class SubmissionsService {
    prisma;
    submissionQueue;
    logger = new Logger(SubmissionsService_1.name);
    constructor(prisma, submissionQueue) {
        this.prisma = prisma;
        this.submissionQueue = submissionQueue;
    }
    async create(input, userId, user) {
        const problem = await this.prisma.problem.findUnique({
            where: { id: input.problemId },
            include: {
                testCases: true,
            },
        });
        if (!problem) {
            throw new NotFoundException(`Problem with ID ${input.problemId} not found`);
        }
        if (problem.status && problem.status !== 'PUBLISHED') {
            throw new ForbiddenException('You cannot submit to an unpublished problem');
        }
        if (problem.institutionId) {
            const canAccessInstitution = user?.globalRole === 'SUPER_ADMIN' ||
                user?.globalRole === 'PLATFORM_ADMIN' ||
                user?.memberships?.some((membership) => membership.institutionId === problem.institutionId);
            if (!canAccessInstitution) {
                throw new ForbiddenException('You do not have access to this problem');
            }
        }
        if (input.contestId) {
            const contest = await this.prisma.contest.findUnique({
                where: { id: input.contestId },
                include: { problems: { where: { problemId: input.problemId } } },
            });
            if (!contest || contest.problems.length === 0) {
                throw new ForbiddenException('This problem is not part of the selected contest');
            }
            if (contest.status !== ContestStatus.ONGOING) {
                throw new ForbiddenException('Submissions are accepted only during an ongoing contest');
            }
            if (contest.institutionId && !user?.memberships?.some((membership) => membership.institutionId === contest.institutionId) && user?.globalRole !== 'SUPER_ADMIN' && user?.globalRole !== 'PLATFORM_ADMIN') {
                throw new ForbiddenException('You do not have access to this contest');
            }
            const registration = await this.prisma.contestRegistration.findUnique({
                where: { contestId_userId: { contestId: input.contestId, userId } },
            });
            if (!registration) {
                throw new ForbiddenException('You must register for the contest before submitting');
            }
        }
        const totalTestCases = problem.testCases.length;
        const submission = await this.prisma.submission.create({
            data: {
                userId,
                problemId: input.problemId,
                contestId: input.contestId,
                language: input.language,
                sourceCode: input.sourceCode,
                status: SubmissionStatus.QUEUED,
                totalTestCases,
                passedTestCases: 0,
            },
            include: {
                user: {
                    select: userSanitizedSelect,
                },
                problem: true,
            },
        });
        if (this.submissionQueue) {
            try {
                await this.submissionQueue.add(EVALUATE_SUBMISSION_JOB, {
                    submissionId: submission.id,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to enqueue submission ${submission.id} to BullMQ: ${err.message}`);
                return this.prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        status: SubmissionStatus.FAILED,
                        verdict: SubmissionVerdict.SYSTEM_ERROR,
                        errorMessage: `Failed to enqueue submission for evaluation: ${err.message}`,
                    },
                    include: {
                        user: {
                            select: userSanitizedSelect,
                        },
                        problem: true,
                    },
                });
            }
        }
        else {
            this.logger.warn(`Submission queue is unavailable for submission ${submission.id}`);
            return this.prisma.submission.update({
                where: { id: submission.id },
                data: {
                    status: SubmissionStatus.FAILED,
                    verdict: SubmissionVerdict.SYSTEM_ERROR,
                    errorMessage: 'Judge submission queue is unavailable',
                },
                include: {
                    user: {
                        select: userSanitizedSelect,
                    },
                    problem: true,
                },
            });
        }
        return submission;
    }
    async findPaginated(args, problemId, userId, contestId, verdict, language) {
        const page = args.page || 1;
        const limit = args.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (problemId) {
            where.problemId = problemId;
        }
        if (userId) {
            where.userId = userId;
        }
        if (contestId) {
            where.contestId = contestId;
        }
        if (verdict) {
            where.verdict = verdict;
        }
        if (language) {
            where.language = language;
        }
        const orderBy = {};
        if (args.sortBy) {
            orderBy[args.sortBy] =
                args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [items, total] = await Promise.all([
            this.prisma.submission.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    user: {
                        select: userSanitizedSelect,
                    },
                    problem: true,
                },
            }),
            this.prisma.submission.count({ where }),
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
    async findById(id) {
        const submission = await this.prisma.submission.findUnique({
            where: { id },
            include: {
                user: {
                    select: userSanitizedSelect,
                },
                problem: true,
            },
        });
        if (!submission) {
            throw new NotFoundException(`Submission with ID ${id} not found`);
        }
        return submission;
    }
    async getLiveFeed(limit = 20) {
        const boundedLimit = Math.min(Math.max(Math.trunc(limit) || 20, 1), 100);
        return this.prisma.submission.findMany({
            take: boundedLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: userSanitizedSelect,
                },
                problem: true,
            },
        });
    }
};
SubmissionsService = SubmissionsService_1 = __decorate([
    Injectable(),
    __param(1, Optional()),
    __param(1, InjectQueue(JUDGE_QUEUE_NAME)),
    __metadata("design:paramtypes", [PrismaService,
        Queue])
], SubmissionsService);
export { SubmissionsService };
//# sourceMappingURL=submissions.service.js.map