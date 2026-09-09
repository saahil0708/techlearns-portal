import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateTestCaseInput')
export class CreateTestCaseInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  input: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  expectedOutput: string;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean = true;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  explanation?: string;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  @IsOptional()
  order?: number = 0;
}
