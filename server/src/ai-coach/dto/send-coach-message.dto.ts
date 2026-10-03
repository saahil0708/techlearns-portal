import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendCoachMessageDto {
  @ApiProperty({ example: 'Diagnose my recent TLE on Longest Common Subsequence' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ example: 'int lcs(string s1, string s2) { ... }' })
  @IsString()
  @IsOptional()
  @MaxLength(20000)
  codeSnippet?: string;
}
