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
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Public, Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';
import { ProblemsService } from './problems.service.js';
import { ProblemType } from './types/problem.type.js';
import { ProblemsConnection } from './types/problems-connection.type.js';
import { TestCaseType } from './types/test-case.type.js';
let ProblemsResolver = class ProblemsResolver {
    problemsService;
    constructor(problemsService) {
        this.problemsService = problemsService;
    }
    async getProblems(paginationArgs, difficulty, status, institutionId, collegeId, currentUser) {
        return this.problemsService.findPaginated(paginationArgs, difficulty, status, institutionId || collegeId, currentUser);
    }
    async getProblem(idOrSlug, currentUser) {
        return this.problemsService.findByIdOrSlug(idOrSlug, currentUser);
    }
    async getProblemTestCases(problemId, currentUser) {
        return this.problemsService.getTestCases(problemId, currentUser);
    }
    async createProblem(input, currentUser) {
        return this.problemsService.create(input, currentUser.id, currentUser);
    }
    async updateProblem(id, input, currentUser) {
        return this.problemsService.update(id, input, currentUser);
    }
    async deleteProblem(id, currentUser) {
        return this.problemsService.delete(id, currentUser);
    }
    async addProblemTestCase(problemId, input, currentUser) {
        return this.problemsService.addTestCase(problemId, input, currentUser);
    }
};
__decorate([
    Query(() => ProblemsConnection, { name: 'problems' }),
    UseGuards(GqlAuthGuard),
    Public(),
    __param(0, Args()),
    __param(1, Args('difficulty', { type: () => ProblemDifficulty, nullable: true })),
    __param(2, Args('status', { type: () => ProblemStatus, nullable: true })),
    __param(3, Args('institutionId', { type: () => String, nullable: true })),
    __param(4, Args('collegeId', { type: () => String, nullable: true })),
    __param(5, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "getProblems", null);
__decorate([
    Query(() => ProblemType, { name: 'problem', nullable: true }),
    UseGuards(GqlAuthGuard),
    Public(),
    __param(0, Args('idOrSlug', { type: () => String })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "getProblem", null);
__decorate([
    Query(() => [TestCaseType], { name: 'problemTestCases' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('problemId', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "getProblemTestCases", null);
__decorate([
    Mutation(() => ProblemType, { name: 'createProblem' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProblemInput, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "createProblem", null);
__decorate([
    Mutation(() => ProblemType, { name: 'updateProblem' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProblemInput, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "updateProblem", null);
__decorate([
    Mutation(() => Boolean, { name: 'deleteProblem' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "deleteProblem", null);
__decorate([
    Mutation(() => TestCaseType, { name: 'addProblemTestCase' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('problemId', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateTestCaseInput, Object]),
    __metadata("design:returntype", Promise)
], ProblemsResolver.prototype, "addProblemTestCase", null);
ProblemsResolver = __decorate([
    Resolver(() => ProblemType),
    __metadata("design:paramtypes", [ProblemsService])
], ProblemsResolver);
export { ProblemsResolver };
//# sourceMappingURL=problems.resolver.js.map