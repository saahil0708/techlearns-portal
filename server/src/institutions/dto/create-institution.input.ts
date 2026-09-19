import { Field, InputType, Int } from '@nestjs/graphql';
import { InstitutionStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType('CreateInstitutionInput')
export class CreateInstitutionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  code: string;

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

  @Field(() => InstitutionStatus, { defaultValue: InstitutionStatus.ACTIVE, nullable: true })
  @IsOptional()
  @IsEnum(InstitutionStatus)
  status?: InstitutionStatus = InstitutionStatus.ACTIVE;
}
