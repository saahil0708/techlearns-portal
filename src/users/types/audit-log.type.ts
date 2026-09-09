import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AuditLogItem')
export class AuditLogItemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  action: string;

  @Field(() => String, { nullable: true })
  detail?: string;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  @Field(() => String)
  status: string;

  @Field(() => Date)
  createdAt: Date;
}
