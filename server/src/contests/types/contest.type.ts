import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ContestStatus } from '@prisma/client';
import { ContestProblemType } from './contest-problem.type.js';
import { ContestRegistrationType } from './contest-registration.type.js';

@ObjectType('ContestCounts')
export class ContestCountsType {
  @Field(() => Int)
  problems: number;

  @Field(() => Int)
  registrations: number;

  @Field(() => Int)
  submissions: number;
}

@ObjectType('Contest')
export class ContestType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date)
  startTime: Date;

  @Field(() => Date)
  endTime: Date;

  @Field(() => String, { nullable: true })
  institutionId?: string;

  @Field(() => String, { nullable: true })
  collegeId?: string;

  @Field(() => String)
  createdById: string;

  @Field(() => ContestStatus)
  status: ContestStatus;

  @Field(() => [ContestProblemType], { nullable: true })
  problems?: ContestProblemType[];

  @Field(() => [ContestRegistrationType], { nullable: true })
  registrations?: ContestRegistrationType[];

  @Field(() => ContestCountsType, { nullable: true })
  _count?: ContestCountsType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
