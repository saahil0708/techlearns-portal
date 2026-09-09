import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('CollegeCounts')
export class CollegeCountsType {
  @Field(() => Int)
  memberships: number;

  @Field(() => Int)
  batches: number;

  @Field(() => Int)
  courses: number;

  @Field(() => Int)
  problems: number;

  @Field(() => Int, { nullable: true })
  contests?: number;
}
