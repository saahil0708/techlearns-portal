import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsOptional, IsString, Min } from 'class-validator';

@InputType('UpdateBatchInput')
export class UpdateBatchInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  maxCapacity?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
