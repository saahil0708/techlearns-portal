import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const USER_GLOBAL_ROLES = [Role.STUDENT, Role.FACULTY, Role.COLLEGE_ADMIN] as const;

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
  collegeId?: string;
}

@InputType('BulkInviteUsersInput')
export class BulkInviteUsersInput {
  @Field(() => [BulkInviteItemInput])
  @IsArray()
  users: BulkInviteItemInput[];
}
