import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Public } from '../common/decorators/roles.decorator.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CompanyTier } from './dto/interview-prep.dto.js';
import { InterviewPrepService } from './interview-prep.service.js';
import {
  AssessmentSessionType,
  AssessmentSubmissionResultType,
  CompanyTrackType,
  InterviewGuideType,
  MockAssessmentType,
  SubmitAssessmentInput,
  UserReadinessType,
} from './types/interview-prep.types.js';

@Resolver()
export class InterviewPrepResolver {
  constructor(private readonly interviewPrepService: InterviewPrepService) {}

  @Query(() => [CompanyTrackType], { name: 'interviewCompanies' })
  @Public()
  async getCompanies(
    @Args('tier', { type: () => CompanyTier, nullable: true }) tier?: CompanyTier,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.interviewPrepService.getCompanies({ tier, search });
  }

  @Query(() => CompanyTrackType, { name: 'interviewCompanyBySlug', nullable: true })
  @Public()
  async getCompanyBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.interviewPrepService.getCompanyBySlug(slug);
  }

  @Query(() => [MockAssessmentType], { name: 'mockAssessments' })
  @Public()
  async getAssessments(@Args('companySlug', { type: () => String, nullable: true }) companySlug?: string) {
    return this.interviewPrepService.getAssessments(companySlug);
  }

  @Query(() => MockAssessmentType, { name: 'mockAssessmentById', nullable: true })
  @Public()
  async getAssessmentById(@Args('id', { type: () => String }) id: string) {
    return this.interviewPrepService.getAssessmentById(id);
  }

  @Query(() => [InterviewGuideType], { name: 'interviewGuides' })
  @Public()
  async getGuides() {
    return this.interviewPrepService.getGuides();
  }

  @Query(() => UserReadinessType, { name: 'userInterviewReadiness', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUserReadiness(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.interviewPrepService.getUserReadiness(currentUser);
  }

  @Mutation(() => AssessmentSessionType, { name: 'startMockAssessment' })
  @UseGuards(GqlAuthGuard)
  async startMockAssessment(
    @Args('assessmentId', { type: () => String }) assessmentId: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.interviewPrepService.startAssessment(assessmentId, currentUser);
  }

  @Mutation(() => AssessmentSubmissionResultType, { name: 'submitMockAssessment' })
  @UseGuards(GqlAuthGuard)
  async submitMockAssessment(
    @Args('sessionId', { type: () => String }) sessionId: string,
    @Args('input', { type: () => SubmitAssessmentInput }) input: SubmitAssessmentInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.interviewPrepService.submitAssessment(sessionId, input, currentUser);
  }
}
