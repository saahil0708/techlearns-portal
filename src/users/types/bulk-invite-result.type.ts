import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface InvitationLinkItem {
  email: string;
  activationUrl: string;
}

export interface BulkInviteResult {
  invited: number;
  expiresInHours: number;
  invitationLinks?: InvitationLinkItem[];
}

@ObjectType('InvitationLinkItem')
export class InvitationLinkItemType implements InvitationLinkItem {
  @Field(() => String)
  email: string;

  @Field(() => String)
  activationUrl: string;
}

@ObjectType('BulkInviteResult')
export class BulkInviteResultType implements BulkInviteResult {
  @Field(() => Int)
  invited: number;

  @Field(() => Int)
  expiresInHours: number;

  @Field(() => [InvitationLinkItemType], { nullable: true })
  invitationLinks?: InvitationLinkItemType[];
}

