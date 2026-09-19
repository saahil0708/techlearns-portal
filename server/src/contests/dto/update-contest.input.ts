import { Field, InputType } from '@nestjs/graphql';
import { ContestStatus } from '@prisma/client';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

@InputType('UpdateContestInput')
export class UpdateContestInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @Field(() => ContestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;
}
