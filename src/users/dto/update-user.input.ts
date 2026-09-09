import { Field, InputType, Int } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

@InputType('UpdateUserInput')
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  globalRole?: Role;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  institution?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  resumeFileName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  contestRating?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ratingTier?: string;
}
