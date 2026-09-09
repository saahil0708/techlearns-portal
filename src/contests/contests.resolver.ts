import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContestStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { ContestsService } from './contests.service.js';
import { AddContestProblemInput } from './dto/add-contest-problem.input.js';
import { CreateContestInput } from './dto/create-contest.input.js';
import { UpdateContestInput } from './dto/update-contest.input.js';
import { ContestProblemType } from './types/contest-problem.type.js';
import { ContestRegistrationType } from './types/contest-registration.type.js';
import { ContestType } from './types/contest.type.js';
import { ContestsConnection } from './types/contests-connection.type.js';

@Resolver(() => ContestType)
export class ContestsResolver {
  constructor(private contestsService: ContestsService) {}

  @Query(() => ContestsConnection, { name: 'contests' })
  async getContests(
    @Args() paginationArgs: PaginationArgs,
    @Args('status', { type: () => ContestStatus, nullable: true })
    status?: ContestStatus,
    @Args('collegeId', { type: () => String, nullable: true })
    collegeId?: string,
  ) {
    return this.contestsService.findPaginated(paginationArgs, status, collegeId);
  }

  @Query(() => ContestType, { name: 'contest', nullable: true })
  async getContest(@Args('id', { type: () => ID }) id: string) {
    return this.contestsService.findById(id);
  }

  @Mutation(() => ContestType, { name: 'createContest' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY)
  async createContest(
    @Args('input') input: CreateContestInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.contestsService.create(input, currentUser.id);
  }

  @Mutation(() => ContestType, { name: 'updateContest' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY)
  async updateContest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateContestInput,
  ) {
    return this.contestsService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteContest' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async deleteContest(@Args('id', { type: () => ID }) id: string) {
    return this.contestsService.delete(id);
  }

  @Mutation(() => ContestRegistrationType, { name: 'registerForContest' })
  @UseGuards(GqlAuthGuard)
  async registerForContest(
    @Args('contestId', { type: () => ID }) contestId: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.contestsService.registerUser(contestId, currentUser.id);
  }

  @Mutation(() => ContestProblemType, { name: 'addContestProblem' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY)
  async addContestProblem(
    @Args('contestId', { type: () => ID }) contestId: string,
    @Args('input') input: AddContestProblemInput,
  ) {
    return this.contestsService.addProblem(contestId, input);
  }
}
