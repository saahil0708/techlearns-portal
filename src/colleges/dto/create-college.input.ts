import { Field, InputType } from '@nestjs/graphql';
import { CollegeStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateCollegeInput')
export class CreateCollegeInput {
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

  @Field(() => CollegeStatus, { defaultValue: CollegeStatus.ACTIVE, nullable: true })
  @IsOptional()
  @IsEnum(CollegeStatus)
  status?: CollegeStatus = CollegeStatus.ACTIVE;
}
