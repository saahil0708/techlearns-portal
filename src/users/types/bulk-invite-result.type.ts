import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('BulkInviteResult')
export class BulkInviteResultType {
  @Field(() => Int)
  invited: number;

  @Field(() => Int)
  expiresInHours: number;
}
