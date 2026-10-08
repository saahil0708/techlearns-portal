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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  batchId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  problemIds?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  durationMinutes?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isProctored?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  enforceFullScreen?: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  tabSwitchLimit?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  disableCopyPaste?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  webcamProctoring?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  audioProctoring?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  plagiarismCheck?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  scoringFormat?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  windowType?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  shuffleQuestions?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ipRestriction?: string;

  @Field(() => ContestStatus, { defaultValue: ContestStatus.UPCOMING, nullable: true })
  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus = ContestStatus.UPCOMING;
}
