import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizMCQDto, CodingProblemDto } from './create-lesson.dto.js';

export class CompositeLessonDto {
  @ApiProperty({ example: 'Array Basics & Memory Layout' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '# Arrays\n\nContiguous memory allocation...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'reading', default: 'reading' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 15, default: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  importantNotes?: string[];

  @ApiPropertyOptional({ type: QuizMCQDto })
  @IsOptional()
  @IsObject()
  quizMCQ?: QuizMCQDto;

  @ApiPropertyOptional({ type: CodingProblemDto })
  @IsOptional()
  @IsObject()
  codingProblem?: CodingProblemDto;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CompositeModuleDto {
  @ApiProperty({ example: 'Module 1: Foundations & Memory' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Deep dive into computer memory models and sequential containers.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({ type: [CompositeLessonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompositeLessonDto)
  lessons: CompositeLessonDto[];
}

export class CreateCompositeCourseDto {
  @ApiProperty({ example: 'Full-Stack Systems Architecture & High-Performance Engineering' })
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @ApiPropertyOptional({ example: 'fullstack-systems-architecture' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'CS-401' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'System Architecture' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Advanced' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'https://cdn.platform.com/courses/sys-arch.png' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 10, default: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningItems?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn?: string[];

  @ApiPropertyOptional({ example: 'Master distributed systems, caching, concurrency, and DB design.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'institution-uuid-12345' })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({ example: 'college-uuid-12345' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ type: [CompositeModuleDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CompositeModuleDto)
  modules: CompositeModuleDto[];
}
