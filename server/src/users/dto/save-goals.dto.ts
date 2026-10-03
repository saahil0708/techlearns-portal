import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SkillItemDto } from './save-diagnostic.dto.js';

export class SaveGoalsDto {
  @ApiProperty({ example: 'Full-Stack Web Architect' })
  @IsString()
  @IsNotEmpty()
  targetTrack!: string;

  @ApiProperty({ example: 'fullstack' })
  @IsString()
  @IsNotEmpty()
  targetTrackId!: string;

  @ApiProperty({ example: '6 months (Standard)' })
  @IsString()
  @IsNotEmpty()
  timeline!: string;

  @ApiProperty({ example: 14 })
  @IsNumber()
  weeklyHours!: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  roleFitScore!: number;

  @ApiProperty({ type: [SkillItemDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills!: SkillItemDto[];

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  targetSolveTimeMins?: number;

  @ApiPropertyOptional({ example: 26 })
  @IsOptional()
  @IsNumber()
  currentAvgSolveTimeMins?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  dailyGoalMins?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  dailyLoggedMins?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  weeklyProblemQuota?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  weeklyProblemsSolved?: number;

  @ApiPropertyOptional({ example: 1750 })
  @IsOptional()
  @IsNumber()
  targetContestRating?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsNumber()
  currentContestRating?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  firstAttemptTargetRate?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsNumber()
  currentFirstAttemptRate?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  streakDays?: number;

  @ApiPropertyOptional({ example: '8/10' })
  @IsOptional()
  @IsString()
  quizScore?: string;

  @ApiPropertyOptional({ type: Object, description: 'Custom goals configuration' })
  @IsOptional()
  @IsObject()
  customGoals?: Record<string, any>;

  @ApiPropertyOptional({ type: [Object], description: 'List of milestones' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  milestones?: any[];
}
