import { Field, InputType } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

const USER_GLOBAL_ROLES = [
  Role.SUPER_ADMIN,
  Role.PLATFORM_ADMIN,
  Role.INSTITUTION_ADMIN,
  Role.FACULTY,
  Role.STUDENT,
] as const;

@InputType('CreateUserInput')
export class CreateUserInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  password: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Role, { defaultValue: Role.STUDENT, nullable: true })
  @IsOptional()
  @IsEnum(USER_GLOBAL_ROLES)
  globalRole?: (typeof USER_GLOBAL_ROLES)[number] = Role.STUDENT;

  @Field(() => UserStatus, { defaultValue: UserStatus.ACTIVE, nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus = UserStatus.ACTIVE;

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
  rollNo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  handle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  username?: string;
}
