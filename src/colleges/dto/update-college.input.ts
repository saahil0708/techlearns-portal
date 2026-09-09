import { Field, InputType } from '@nestjs/graphql';
import { CollegeStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

@InputType('UpdateCollegeInput')
export class UpdateCollegeInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => CollegeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CollegeStatus)
  status?: CollegeStatus;
}
