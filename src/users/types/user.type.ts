import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';

@ObjectType('UserInstitutionMembershipInstitution')
export class UserInstitutionMembershipInstitutionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

@ObjectType('UserInstitutionMembership')
export class UserInstitutionMembershipType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  institutionId: string;

  @Field(() => Role)
  role: Role;

  @Field(() => UserInstitutionMembershipInstitutionType, { nullable: true })
  institution?: UserInstitutionMembershipInstitutionType;
}

@ObjectType('UserBatchEnrollmentBatch')
export class UserBatchEnrollmentBatchType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

@ObjectType('UserBatchEnrollment')
export class UserBatchEnrollmentType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  batchId: string;

  @Field(() => String, { nullable: true })
  rollNo?: string;

  @Field(() => UserBatchEnrollmentBatchType, { nullable: true })
  batch?: UserBatchEnrollmentBatchType;
}

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

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  bannerUrl?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  institution?: string;

  @Field(() => String, { nullable: true })
  department?: string;

  @Field(() => String, { nullable: true })
  specialization?: string;

  @Field(() => String, { nullable: true })
  officeHours?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  birthDate?: string;

  @Field(() => String, { nullable: true })
  githubUrl?: string;

  @Field(() => String, { nullable: true })
  linkedinUrl?: string;

  @Field(() => String, { nullable: true })
  websiteUrl?: string;

  @Field(() => String, { nullable: true })
  resumeUrl?: string;

  @Field(() => String, { nullable: true })
  resumeFileName?: string;

  @Field(() => String, { nullable: true })
  rollNo?: string;

  @Field(() => Int, { defaultValue: 1500 })
  contestRating: number;

  @Field(() => String, { defaultValue: 'Novice' })
  ratingTier: string;

  @Field(() => [UserInstitutionMembershipType], { nullable: true })
  memberships?: UserInstitutionMembershipType[];

  @Field(() => [UserBatchEnrollmentType], { nullable: true })
  batchEnrollments?: UserBatchEnrollmentType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
