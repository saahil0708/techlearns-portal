import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateSubmissionInput } from './dto/create-submission.input.js';
import { SubmissionsService } from './submissions.service.js';
import { SubmissionType } from './types/submission.type.js';
import { SubmissionsConnection } from './types/submissions-connection.type.js';

@Resolver(() => SubmissionType)
export class SubmissionsResolver {
  constructor(private submissionsService: SubmissionsService) {}

  @Query(() => SubmissionsConnection, { name: 'submissions' })
  async getSubmissions(
    @Args() paginationArgs: PaginationArgs,
    @Args('problemId', { type: () => String, nullable: true }) problemId?: string,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('contestId', { type: () => String, nullable: true }) contestId?: string,
    @Args('verdict', { type: () => SubmissionVerdict, nullable: true })
    verdict?: SubmissionVerdict,
    @Args('language', { type: () => ProgrammingLanguage, nullable: true })
    language?: ProgrammingLanguage,
  ) {
    return this.submissionsService.findPaginated(
      paginationArgs,
      problemId,
      userId,
      contestId,
      verdict,
      language,
    );
  }

  @Query(() => SubmissionType, { name: 'submission', nullable: true })
  async getSubmission(@Args('id', { type: () => ID }) id: string) {
    return this.submissionsService.findById(id);
  }

  @Query(() => [SubmissionType], { name: 'liveSubmissions' })
  async getLiveSubmissions(
    @Args('limit', { type: () => Int, defaultValue: 20, nullable: true })
    limit?: number,
  ) {
    return this.submissionsService.getLiveFeed(limit || 20);
  }

  @Mutation(() => SubmissionType, { name: 'submitCode' })
  @UseGuards(GqlAuthGuard)
  async submitCode(
    @Args('input') input: CreateSubmissionInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.submissionsService.create(input, currentUser.id);
  }
}
