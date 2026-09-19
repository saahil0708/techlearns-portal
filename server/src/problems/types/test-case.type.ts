import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('TestCase')
export class TestCaseType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  problemId: string;

  @Field(() => String)
  input: string;

  @Field(() => String)
  expectedOutput: string;

  @Field(() => Boolean)
  isHidden: boolean;

  @Field(() => String, { nullable: true })
  explanation?: string;

  @Field(() => Int)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
