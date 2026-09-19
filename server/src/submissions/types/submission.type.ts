import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProgrammingLanguage, SubmissionStatus, SubmissionVerdict } from '@prisma/client';
import { ProblemType } from '../../problems/types/problem.type.js';
import { UserType } from '../../users/types/user.type.js';

@ObjectType('Submission')
export class SubmissionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  problemId: string;

  @Field(() => String, { nullable: true })
  contestId?: string;

  @Field(() => ProgrammingLanguage)
  language: ProgrammingLanguage;

  @Field(() => String, { nullable: true })
  sourceCode?: string;

  @Field(() => SubmissionStatus)
  status: SubmissionStatus;

  @Field(() => SubmissionVerdict, { nullable: true })
  verdict?: SubmissionVerdict;

  @Field(() => Int, { nullable: true })
  runtime?: number;

  @Field(() => Int, { nullable: true })
  memory?: number;

  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Field(() => Int)
  passedTestCases: number;

  @Field(() => Int)
  totalTestCases: number;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => ProblemType, { nullable: true })
  problem?: ProblemType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
