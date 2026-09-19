import { Field, ID, InputType } from '@nestjs/graphql';
import { ProgrammingLanguage } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateSubmissionInput')
export class CreateSubmissionInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  problemId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  contestId?: string;

  @Field(() => ProgrammingLanguage)
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  sourceCode: string;
}
