import { Field, ID, ObjectType } from '@nestjs/graphql';
import { InstitutionStatus } from '@prisma/client';
import { InstitutionCountsType } from './institution-counts.type.js';
import { InstitutionMembershipType } from './institution-membership.type.js';

@ObjectType('Institution')
export class InstitutionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => InstitutionStatus)
  status: InstitutionStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => InstitutionCountsType, { nullable: true })
  _count?: InstitutionCountsType;

  @Field(() => [InstitutionMembershipType], { nullable: true })
  memberships?: InstitutionMembershipType[];
}
