import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/types/user.type.js';

@ObjectType('BatchStudent')
export class BatchStudentType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  batchId: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  rollNo?: string;

  @Field(() => Date)
  enrolledAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}
