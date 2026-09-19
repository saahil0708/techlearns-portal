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
import { ContestStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { ContestsService } from './contests.service.js';
import { AddContestProblemInput } from './dto/add-contest-problem.input.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';
import { ContestProblemType } from './types/contest-problem.type.js';
import { ContestRegistrationType } from './types/contest-registration.type.js';
import { ContestType } from './types/contest.type.js';
import { ContestsConnection } from './types/contests-connection.type.js';
let ContestsResolver = class ContestsResolver {
    contestsService;
    constructor(contestsService) {
        this.contestsService = contestsService;
    }
    async getContests(paginationArgs, status, institutionId, collegeId, currentUser) {
        return this.contestsService.findPaginated(paginationArgs, status, institutionId || collegeId, currentUser);
    }
    async getContest(id, currentUser) {
        return this.contestsService.findById(id, currentUser);
    }
    async createContest(input, currentUser) {
        return this.contestsService.create(input, currentUser.id, currentUser);
    }
    async updateContest(id, input, currentUser) {
        return this.contestsService.update(id, input, currentUser);
    }
    async deleteContest(id, currentUser) {
        return this.contestsService.delete(id, currentUser);
    }
    async registerForContest(contestId, currentUser) {
        return this.contestsService.registerUser(contestId, currentUser.id, currentUser);
    }
    async addContestProblem(contestId, input, currentUser) {
        return this.contestsService.addProblem(contestId, input, currentUser);
    }
};
__decorate([
    Query(() => ContestsConnection, { name: 'contests' }),
    __param(0, Args()),
    __param(1, Args('status', { type: () => ContestStatus, nullable: true })),
    __param(2, Args('institutionId', { type: () => String, nullable: true })),
    __param(3, Args('collegeId', { type: () => String, nullable: true })),
    __param(4, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationArgs, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "getContests", null);
__decorate([
    Query(() => ContestType, { name: 'contest', nullable: true }),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "getContest", null);
__decorate([
    Mutation(() => ContestType, { name: 'createContest' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('input')),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateContestInput, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "createContest", null);
__decorate([
    Mutation(() => ContestType, { name: 'updateContest' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateContestInput, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "updateContest", null);
__decorate([
    Mutation(() => Boolean, { name: 'deleteContest' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('id', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "deleteContest", null);
__decorate([
    Mutation(() => ContestRegistrationType, { name: 'registerForContest' }),
    UseGuards(GqlAuthGuard),
    __param(0, Args('contestId', { type: () => ID })),
    __param(1, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "registerForContest", null);
__decorate([
    Mutation(() => ContestProblemType, { name: 'addContestProblem' }),
    UseGuards(GqlAuthGuard, GqlRolesGuard),
    Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN),
    __param(0, Args('contestId', { type: () => ID })),
    __param(1, Args('input')),
    __param(2, GqlCurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddContestProblemInput, Object]),
    __metadata("design:returntype", Promise)
], ContestsResolver.prototype, "addContestProblem", null);
ContestsResolver = __decorate([
    Resolver(() => ContestType),
    __metadata("design:paramtypes", [ContestsService])
], ContestsResolver);
export { ContestsResolver };
//# sourceMappingURL=contests.resolver.js.map