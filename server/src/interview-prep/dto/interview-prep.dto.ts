import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CompanyTier {
  FAANG = 'FAANG',
  BIG_TECH = 'BIG_TECH',
  FINTECH = 'FINTECH',
  UNICORN = 'UNICORN',
  ENTERPRISE = 'ENTERPRISE',
}

export enum InterviewStage {
  ONLINE_ASSESSMENT = 'ONLINE_ASSESSMENT',
  TECHNICAL_PHONE = 'TECHNICAL_PHONE',
  ONSITE_ALGO = 'ONSITE_ALGO',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  BEHAVIORAL = 'BEHAVIORAL',
}

export class ListCompaniesQueryDto {
  @ApiPropertyOptional({ enum: CompanyTier })
  @IsOptional()
  @IsEnum(CompanyTier)
  tier?: CompanyTier;

  @ApiPropertyOptional({ description: 'Search term for company name or topic' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class StartAssessmentDto {
  @ApiPropertyOptional({ description: 'Optional session metadata' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitAssessmentAnswerDto {
  @ApiProperty({ description: 'Problem ID or slug' })
  @IsString()
  problemId: string;

  @ApiPropertyOptional({ description: 'Submitted source code' })
  @IsOptional()
  @IsString()
  sourceCode?: string;

  @ApiPropertyOptional({ description: 'Programming language used' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Calculated self-score or passed test cases percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scorePercentage?: number;

  @ApiPropertyOptional({ description: 'Time taken in seconds' })
  @IsOptional()
  @IsNumber()
  timeSpentSeconds?: number;
}

export class SubmitAssessmentDto {
  @ApiProperty({ type: [SubmitAssessmentAnswerDto], description: 'List of problem answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAssessmentAnswerDto)
  answers: SubmitAssessmentAnswerDto[];

  @ApiPropertyOptional({ description: 'Feedback or self-reflection notes' })
  @IsOptional()
  @IsString()
  reflectionNotes?: string;
}
