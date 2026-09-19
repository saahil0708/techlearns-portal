import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('BatchCounts')
export class BatchCountsType {
  @Field(() => Int, { defaultValue: 0 })
  students: number;
}
