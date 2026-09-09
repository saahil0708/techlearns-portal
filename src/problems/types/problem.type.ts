import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { TestCaseType } from './test-case.type.js';

@ObjectType('ProblemCounts')
export class ProblemCountsType {
  @Field(() => Int)
  submissions: number;

  @Field(() => Int)
  testCases: number;
}

@ObjectType('Problem')
export class ProblemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  statement: string;

  @Field(() => String)
  inputFormat: string;

  @Field(() => String)
  outputFormat: string;

  @Field(() => String)
  constraints: string;

  @Field(() => ProblemDifficulty)
  difficulty: ProblemDifficulty;

  @Field(() => Int)
  timeLimit: number;

  @Field(() => Int)
  memoryLimit: number;

  @Field(() => String, { nullable: true })
  collegeId?: string;

  @Field(() => String)
  createdById: string;

  @Field(() => ProblemStatus)
  status: ProblemStatus;

  @Field(() => [TestCaseType], { nullable: true })
  testCases?: TestCaseType[];

  @Field(() => ProblemCountsType, { nullable: true })
  _count?: ProblemCountsType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
