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
import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver, Root, ResolveField } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { ProgrammingLanguage, Role, SubmissionVerdict } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { CreateSubmissionInput } from './dto/create-submission.input.js';
import { SubmissionsService } from './submissions.service.js';
import { SubmissionType } from './types/submission.type.js';
import { SubmissionsConnection } from './types/submissions-connection.type.js';
let SubmissionsResolver = class SubmissionsResolver {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async getSubmissions(paginationArgs, problemId, userId, contestId, verdict, language, currentUser) {
        const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
        const effectiveUserId = isAdmin ? userId : currentUser?.id;
        return this.submissionsService.findPaginated(paginationArgs, problemId, effectiveUserId, contestId, verdict, language);
    }
    async getSubmission(id, currentUser) {
        const submission = await this.submissionsService.findById(id);
        const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN || currentUser.globalRole === Role.PLATFORM_ADMIN;
        if (!isAdmin && submission.userId !== currentUser.id) {
            throw new Error('Not authorized to view this submission');
        }
        return submission;
    }
    async getLiveSubmissions(limit, currentUser) {
        const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
        if (!isAdmin) {
            throw new Error('Not authorized to view live submissions feed');
        }
        return this.submissionsService.getLiveFeed(limit || 20);
    }
    async submitCode(input, currentUser) {
        return this.submissionsService.create(input, currentUser.id, currentUser);
    }
    async sourceCode(submission, context) {
        const currentUser = context.req.user;
        const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
        if (!isAdmin && submission.userId !== currentUser?.id) {
            return null;
        }
        return submission.sourceCode ?? null;
    }
};
__decorate([
    Query(() => SubmissionsConnection, { name: 'submissions' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args()),
    __param(1, Args('problemId', { type: () => String, nullable: true })),
    __param(2, Args('userId', { type: () => String, nullable: true })),
    __param(3, Args('contestId', { type: () => String, nullable: true })),
    __param(4, Args('verdict', { type: () => SubmissionVerdict, nullable: true })),
    __param(5, Args('language', { type: () => ProgrammingLanguage, nullable: true })),
    __param(6, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsResolver.prototype, "getSubmissions", null);
__decorate([
    Query(() => SubmissionType, { name: 'submission', nullable: true }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsResolver.prototype, "getSubmission", null);
__decorate([
    Query(() => [SubmissionType], { name: 'liveSubmissions' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('limit', { type: () => Int, defaultValue: 20, nullable: true })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsResolver.prototype, "getLiveSubmissions", null);
__decorate([
    Mutation(() => SubmissionType, { name: 'submitCode' }),
    UseGuards(GqlAuthGuard),
    Throttle({ default: { limit: 20, ttl: 60_000 } }),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSubmissionInput, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsResolver.prototype, "submitCode", null);
__decorate([
    ResolveField(() => String, { nullable: true }),
    __param(0, Root()),
    __param(1, Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmissionType, Object]),
    __metadata("design:returntype", Promise)
], SubmissionsResolver.prototype, "sourceCode", null);
SubmissionsResolver = __decorate([
    Resolver(() => SubmissionType),
    __metadata("design:paramtypes", [SubmissionsService])
], SubmissionsResolver);
export { SubmissionsResolver };
//# sourceMappingURL=submissions.resolver.js.map