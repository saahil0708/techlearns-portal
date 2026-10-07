import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ExplainProblemDto {
  @ApiProperty({ description: 'Problem title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Problem statement in markdown' })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiPropertyOptional({ description: 'Problem difficulty' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Problem tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class ProgressiveHintDto {
  @ApiProperty({ description: 'Problem title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Problem statement in markdown' })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiProperty({ description: 'Hint level: 1 (Intuition), 2 (Invariant/Complexity), 3 (Pseudocode/Edge cases)', enum: [1, 2, 3] })
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2, 3])
  level: 1 | 2 | 3;

  @ApiPropertyOptional({ description: 'Current code in editor' })
  @IsString()
  @IsOptional()
  currentCode?: string;

  @ApiPropertyOptional({ description: 'Programming language' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class DiagnoseFailureDto {
  @ApiProperty({ description: 'Problem title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Current code in editor' })
  @IsString()
  @IsNotEmpty()
  currentCode: string;

  @ApiPropertyOptional({ description: 'Programming language' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Submission verdict' })
  @IsString()
  @IsOptional()
  verdict?: string;

  @ApiPropertyOptional({ description: 'Failed test case input' })
  @IsString()
  @IsOptional()
  failedInput?: string;

  @ApiPropertyOptional({ description: 'Expected output' })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({ description: 'Actual output' })
  @IsString()
  @IsOptional()
  actualOutput?: string;
}

export class ChatAssistantDto {
  @ApiProperty({ description: 'User chat prompt or question' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Problem title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Problem statement in markdown/HTML' })
  @IsString()
  @IsNotEmpty()
  statement: string;

  @ApiPropertyOptional({ description: 'Problem difficulty' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Problem tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Current code in editor' })
  @IsString()
  @IsOptional()
  currentCode?: string;

  @ApiPropertyOptional({ description: 'Programming language' })
  @IsString()
  @IsOptional()
  language?: string;
}

