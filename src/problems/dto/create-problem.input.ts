import { Field, InputType, Int } from '@nestjs/graphql';
import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateTestCaseInput } from './create-test-case.input.js';

@InputType('CreateProblemInput')
export class CreateProblemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  statement: string;

  @Field(() => String, { defaultValue: '' })
  @IsString()
  inputFormat: string;

  @Field(() => String, { defaultValue: '' })
  @IsString()
  outputFormat: string;

  @Field(() => String, { defaultValue: '' })
  @IsString()
  constraints: string;

  @Field(() => ProblemDifficulty, { defaultValue: ProblemDifficulty.MEDIUM })
  @IsEnum(ProblemDifficulty)
  difficulty: ProblemDifficulty = ProblemDifficulty.MEDIUM;

  @Field(() => Int, { defaultValue: 1000 })
  @Min(100)
  @Max(10000)
  timeLimit: number = 1000;

  @Field(() => Int, { defaultValue: 256 })
  @Min(16)
  @Max(1024)
  memoryLimit: number = 256;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @Field(() => ProblemStatus, { defaultValue: ProblemStatus.PUBLISHED, nullable: true })
  @IsOptional()
  @IsEnum(ProblemStatus)
  status?: ProblemStatus = ProblemStatus.PUBLISHED;

  @Field(() => [CreateTestCaseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  testCases?: CreateTestCaseInput[];
}
