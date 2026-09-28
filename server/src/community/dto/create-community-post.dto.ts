import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommunityPostDto {
  @ApiProperty({ example: 'How I passed Google SDE-2 Assessment: Key DP & Graph Patterns' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @ApiPropertyOptional({ example: 'Interview Experiences' })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiProperty({ example: 'Sharing my complete 6-month revision timeline...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: ['Google', 'Interviews', 'Algorithms'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreateCommunityReplyDto {
  @ApiProperty({ example: 'Thanks for the detailed breakdown! Did they ask Trie optimizations?' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
