import { Field, InputType } from '@nestjs/graphql';
import { ContestStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateContestInput')
export class CreateContestInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Date)
  @IsDate()
  startTime: Date;

  @Field(() => Date)
  @IsDate()
  endTime: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @Field(() => ContestStatus, { defaultValue: ContestStatus.UPCOMING, nullable: true })
  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus = ContestStatus.UPCOMING;
}
