import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Role)
  globalRole: Role;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
