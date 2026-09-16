import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType('CreateBatchInput')
export class CreateBatchInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Batch name is required' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  @IsOptional()
  @Min(1)
  maxCapacity?: number = 100;

  @Field(() => String, { nullable: true, defaultValue: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string = 'ACTIVE';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
