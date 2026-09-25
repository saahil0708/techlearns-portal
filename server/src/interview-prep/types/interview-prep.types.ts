import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CompanyTier, InterviewStage } from '../dto/interview-prep.dto.js';

registerEnumType(CompanyTier, { name: 'CompanyTier' });
registerEnumType(InterviewStage, { name: 'InterviewStage' });

@ObjectType()
export class CompanyRoundType {
  @Field(() => InterviewStage)
  stage: InterviewStage;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  duration: string;
}

@ObjectType()
export class CompanyQuestionType {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  difficulty: string;

  @Field()
  topic: string;

  @Field(() => Int)
  frequency: number;

  @Field(() => InterviewStage)
  interviewStage: InterviewStage;

  @Field(() => Int)
  expectedMinutes: number;

  @Field(() => [String])
  hints: string[];
}

@ObjectType()
export class CompanyTrackType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => CompanyTier)
  tier: CompanyTier;

  @Field()
  logo: string;

  @Field()
  overview: string;

  @Field()
  difficulty: string;

  @Field()
  acceptanceRate: number;

  @Field(() => [CompanyRoundType])
  rounds: CompanyRoundType[];

  @Field(() => [String])
  focusTopics: string[];

  @Field(() => Int)
  totalQuestions: number;

  @Field(() => [CompanyQuestionType])
  questions: CompanyQuestionType[];
}

@ObjectType()
export class AssessmentProblemType {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  difficulty: string;

  @Field()
  topic: string;

  @Field(() => Int)
  points: number;
}

@ObjectType()
export class MockAssessmentType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  companySlug: string;

  @Field()
  companyName: string;

  @Field(() => CompanyTier)
  tier: CompanyTier;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Int)
  passingScore: number;

  @Field()
  description: string;

  @Field(() => [String])
  problemIds: string[];

  @Field(() => [AssessmentProblemType])
  problems: AssessmentProblemType[];
}

@ObjectType()
export class AssessmentSessionType {
  @Field(() => ID)
  sessionId: string;

  @Field(() => MockAssessmentType)
  assessment: MockAssessmentType;

  @Field()
  expiresAt: number;
}

@ObjectType()
export class AssessmentSubmissionResultType {
  @Field()
  success: boolean;

  @Field(() => Int)
  score: number;

  @Field()
  verdict: string;

  @Field(() => Int)
  totalPoints: number;

  @Field(() => Int)
  earnedPoints: number;

  @Field()
  feedback: string;
}

@ObjectType()
export class InterviewGuideType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  category: string;

  @Field(() => Int)
  readingTimeMinutes: number;

  @Field()
  summary: string;

  @Field()
  content: string;

  @Field(() => [String])
  tags: string[];
}

@ObjectType()
export class CompanyBreakdownType {
  @Field()
  companySlug: string;

  @Field()
  companyName: string;

  @Field(() => Int)
  readinessPct: number;

  @Field(() => Int)
  solvedCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field()
  recommendedTopic: string;
}

@ObjectType()
export class UserReadinessType {
  @Field(() => Int)
  overallReadinessPct: number;

  @Field(() => Int)
  totalSolvedProblems: number;

  @Field()
  targetCompany: string;

  @Field(() => [CompanyBreakdownType])
  companyBreakdowns: CompanyBreakdownType[];

  @Field(() => [String])
  strengths: string[];

  @Field(() => [String])
  weaknesses: string[];
}

@InputType()
export class SubmitAssessmentAnswerInput {
  @Field()
  problemId: string;

  @Field({ nullable: true })
  sourceCode?: string;

  @Field({ nullable: true })
  language?: string;

  @Field(() => Int, { nullable: true })
  scorePercentage?: number;

  @Field(() => Int, { nullable: true })
  timeSpentSeconds?: number;
}

@InputType()
export class SubmitAssessmentInput {
  @Field(() => [SubmitAssessmentAnswerInput])
  answers: SubmitAssessmentAnswerInput[];

  @Field({ nullable: true })
  reflectionNotes?: string;
}
