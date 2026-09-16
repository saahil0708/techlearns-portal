import { Field, InputType, Int } from '@nestjs/graphql';
import { InstitutionStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType('UpdateInstitutionInput')
export class UpdateInstitutionInput {
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  tier?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @Field(() => InstitutionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InstitutionStatus)
  status?: InstitutionStatus;
}
