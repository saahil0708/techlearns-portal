import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Public, Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';
import { ProblemsService } from './problems.service.js';
import { ProblemType } from './types/problem.type.js';
import { ProblemsConnection } from './types/problems-connection.type.js';
import { TestCaseType } from './types/test-case.type.js';

@Resolver(() => ProblemType)
export class ProblemsResolver {
  constructor(private problemsService: ProblemsService) {}

  @Query(() => ProblemsConnection, { name: 'problems' })
  @UseGuards(GqlAuthGuard)
  @Public()
  async getProblems(
    @Args() paginationArgs: PaginationArgs,
    @Args('difficulty', { type: () => ProblemDifficulty, nullable: true })
    difficulty?: ProblemDifficulty,
    @Args('status', { type: () => ProblemStatus, nullable: true })
    status?: ProblemStatus,
    @Args('institutionId', { type: () => String, nullable: true })
    institutionId?: string,
    @Args('collegeId', { type: () => String, nullable: true })
    collegeId?: string,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.problemsService.findPaginated(
      paginationArgs,
      difficulty,
      status,
      institutionId || collegeId,
      currentUser,
    );
  }

  @Query(() => ProblemType, { name: 'problem', nullable: true })
  @UseGuards(GqlAuthGuard)
  @Public()
  async getProblem(
    @Args('idOrSlug', { type: () => String }) idOrSlug: string,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.problemsService.findByIdOrSlug(idOrSlug, currentUser);
  }

  @Query(() => [TestCaseType], { name: 'problemTestCases' })
  @UseGuards(GqlAuthGuard)
  async getProblemTestCases(
    @Args('problemId', { type: () => ID }) problemId: string,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.problemsService.getTestCases(problemId, currentUser);
  }

  @Mutation(() => ProblemType, { name: 'createProblem' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN)
  async createProblem(
    @Args('input') input: CreateProblemInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.problemsService.create(input, currentUser.id, currentUser);
  }

  @Mutation(() => ProblemType, { name: 'updateProblem' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN)
  async updateProblem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProblemInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.problemsService.update(id, input, currentUser);
  }

  @Mutation(() => Boolean, { name: 'deleteProblem' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN)
  async deleteProblem(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.problemsService.delete(id, currentUser);
  }

  @Mutation(() => TestCaseType, { name: 'addProblemTestCase' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.INSTITUTION_ADMIN)
  async addProblemTestCase(
    @Args('problemId', { type: () => ID }) problemId: string,
    @Args('input') input: CreateTestCaseInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.problemsService.addTestCase(problemId, input, currentUser);
  }
}
