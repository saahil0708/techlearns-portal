import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Int, Mutation, Query, Resolver, Root, ResolveField } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { ProgrammingLanguage, Role, SubmissionVerdict } from '@prisma/client';
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
  @UseGuards(GqlAuthGuard)
  async getSubmissions(
    @Args() paginationArgs: PaginationArgs,
    @Args('problemId', { type: () => String, nullable: true }) problemId?: string,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('contestId', { type: () => String, nullable: true }) contestId?: string,
    @Args('verdict', { type: () => SubmissionVerdict, nullable: true })
    verdict?: SubmissionVerdict,
    @Args('language', { type: () => ProgrammingLanguage, nullable: true })
    language?: ProgrammingLanguage,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    // Non-admins can only see their own submissions
    const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
    const effectiveUserId = isAdmin ? userId : currentUser?.id;
    return this.submissionsService.findPaginated(
      paginationArgs,
      problemId,
      effectiveUserId,
      contestId,
      verdict,
      language,
    );
  }

  @Query(() => SubmissionType, { name: 'submission', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getSubmission(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const submission = await this.submissionsService.findById(id);
    const isAdmin = currentUser.globalRole === Role.SUPER_ADMIN || currentUser.globalRole === Role.PLATFORM_ADMIN;
    if (!isAdmin && submission.userId !== currentUser.id) {
      throw new Error('Not authorized to view this submission');
    }
    return submission;
  }

  @Query(() => [SubmissionType], { name: 'liveSubmissions' })
  @UseGuards(GqlAuthGuard)
  async getLiveSubmissions(
    @Args('limit', { type: () => Int, defaultValue: 20, nullable: true })
    limit?: number,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    // Only admins can see live feed of all submissions
    const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
    if (!isAdmin) {
      throw new Error('Not authorized to view live submissions feed');
    }
    return this.submissionsService.getLiveFeed(limit || 20);
  }

  @Mutation(() => SubmissionType, { name: 'submitCode' })
  @UseGuards(GqlAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async submitCode(
    @Args('input') input: CreateSubmissionInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.submissionsService.create(input, currentUser.id, currentUser);
  }

  @ResolveField(() => String, { nullable: true })
  async sourceCode(
    @Root() submission: SubmissionType,
    @Context() context: { req: { user?: CurrentUserPayload } },
  ): Promise<string | null> {
    const currentUser = context.req.user;
    const isAdmin = currentUser?.globalRole === Role.SUPER_ADMIN || currentUser?.globalRole === Role.PLATFORM_ADMIN;
    if (!isAdmin && submission.userId !== currentUser?.id) {
      return null;
    }
    return submission.sourceCode ?? null;
  }
}
