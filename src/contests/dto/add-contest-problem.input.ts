import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType('AddContestProblemInput')
export class AddContestProblemInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  problemId: string;

  @Field(() => Int, { defaultValue: 100, nullable: true })
  @IsOptional()
  @Min(1)
  points?: number = 100;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  @IsOptional()
  order?: number = 0;
}
