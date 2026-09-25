import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BootcampSyllabusItemDto {
  @ApiProperty({ example: 'Week 1-2' })
  @IsString()
  week!: string;

  @ApiProperty({ example: 'Advanced TypeScript & Next.js Architecture' })
  @IsString()
  topic!: string;

  @ApiProperty({ example: 'Production Enterprise SaaS Boilerplate' })
  @IsString()
  deliverables!: string;
}

export class CreateBootcampDto {
  @ApiProperty({ example: 'Full Stack AI Engineering Sprint' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Master Full Stack GenAI, Next.js 15, and Vector Search' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'Comprehensive intensive bootcamp with live industry projects.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'GenAI & LLMs' })
  @IsString()
  track!: string;

  @ApiProperty({ example: 'Dr. Alex Vance' })
  @IsString()
  instructor!: string;

  @ApiPropertyOptional({ example: 'Principal AI Architect' })
  @IsOptional()
  @IsString()
  instructorRole?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' })
  @IsOptional()
  @IsString()
  instructorAvatar?: string;

  @ApiProperty({ example: '6 Weeks (Live Sprints)' })
  @IsString()
  duration!: string;

  @ApiPropertyOptional({ example: 'Intermediate' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'CEL Featured' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ example: 4.9 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalSessions?: number;

  @ApiPropertyOptional({ example: 'PUBLISHED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-10-01T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-11-15T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2026-10-05T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  nextSessionDate?: string;

  @ApiPropertyOptional({ example: 'Vector Database Indexing with Pinecone' })
  @IsOptional()
  @IsString()
  nextSessionTopic?: string;

  @ApiPropertyOptional({ type: [BootcampSyllabusItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BootcampSyllabusItemDto)
  syllabus?: BootcampSyllabusItemDto[];

  @ApiPropertyOptional({ example: 'uuid-of-institution' })
  @IsOptional()
  @IsString()
  institutionId?: string;
}
