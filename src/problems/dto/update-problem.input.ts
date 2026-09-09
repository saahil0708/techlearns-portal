import { Field, InputType, Int } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType('UpdateProblemInput')
export class UpdateProblemInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  statement?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  inputFormat?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  outputFormat?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  constraints?: string;

  @Field(() => ProblemDifficulty, { nullable: true })
  @IsOptional()
  @IsEnum(ProblemDifficulty)
  difficulty?: ProblemDifficulty;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(100)
  @Max(10000)
  timeLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(16)
  @Max(1024)
  memoryLimit?: number;

  @Field(() => ProblemStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProblemStatus)
  status?: ProblemStatus;
}
