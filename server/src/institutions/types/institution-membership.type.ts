import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType('InstitutionMembershipUser')
export class InstitutionMembershipUserType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  department?: string;
}

@ObjectType('InstitutionMembership')
export class InstitutionMembershipType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  institutionId: string;

  @Field(() => Role)
  role: Role;

  @Field(() => InstitutionMembershipUserType, { nullable: true })
  user?: InstitutionMembershipUserType;
}
