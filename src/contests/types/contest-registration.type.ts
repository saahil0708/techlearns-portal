import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/types/user.type.js';

@ObjectType('ContestRegistration')
export class ContestRegistrationType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  contestId: string;

  @Field(() => String)
  userId: string;

  @Field(() => Date)
  registeredAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}
