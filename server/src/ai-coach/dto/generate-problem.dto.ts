import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GenerateProblemDto {
  @ApiPropertyOptional({
    description: 'Prompt or description of the coding challenge to generate',
    example: 'Create a dynamic programming problem on longest palindromic subsequence with string constraints',
  })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Optional seed title', example: 'Longest Palindromic Subsequence' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Problem topic category', example: 'Dynamic Programming' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Difficulty level (Easy, Medium, Hard)', example: 'Medium' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Existing problem statement if refining or generating test cases' })
  @IsString()
  @IsOptional()
  statement?: string;

  @ApiPropertyOptional({
    description: 'Task type',
    enum: ['full_problem', 'statement_only', 'test_cases', 'constraints_only'],
    default: 'full_problem',
  })
  @IsString()
  @IsIn(['full_problem', 'statement_only', 'test_cases', 'constraints_only'])
  @IsOptional()
  taskType?: 'full_problem' | 'statement_only' | 'test_cases' | 'constraints_only';
}
