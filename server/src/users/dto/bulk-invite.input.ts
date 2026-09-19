import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const USER_GLOBAL_ROLES = [
  Role.SUPER_ADMIN,
  Role.PLATFORM_ADMIN,
  Role.INSTITUTION_ADMIN,
  Role.FACULTY,
  Role.STUDENT,
] as const;

@InputType('BulkInviteItemInput')
export class BulkInviteItemInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(USER_GLOBAL_ROLES)
  role: (typeof USER_GLOBAL_ROLES)[number] = Role.STUDENT;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  batchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rollNo?: string;
}

@InputType('BulkInviteUsersInput')
export class BulkInviteUsersInput {
  @Field(() => [BulkInviteItemInput])
  @IsArray()
  users: BulkInviteItemInput[];
}
