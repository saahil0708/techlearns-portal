import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProblemType } from '../../problems/types/problem.type.js';

@ObjectType('ContestProblem')
export class ContestProblemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  contestId: string;

  @Field(() => String)
  problemId: string;

  @Field(() => Int)
  points: number;

  @Field(() => Int)
  order: number;

  @Field(() => ProblemType, { nullable: true })
  problem?: ProblemType;
}
