import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Data Structures and Algorithms in C++',
    description: 'Title of the course',
  })
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @ApiPropertyOptional({
    example: 'dsa-in-cpp',
    description: 'SEO-friendly URL slug (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 'CS-301',
    description: 'Course catalog code',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: 'Computer Science & DSA',
    description: 'Course domain category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Intermediate',
    description: 'Target skill level (Beginner | Intermediate | Advanced)',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.platform.com/courses/dsa-cpp.png',
    description: 'Cover thumbnail URL',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Estimated course duration in weeks',
    default: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;

  @ApiPropertyOptional({
    example: ['C++', 'Algorithms', 'Data Structures'],
    description: 'Search and topic tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: ['Master Big-O analysis', 'Implement balanced trees and graphs from scratch'],
    description: 'Key learning outcomes ("What you will learn")',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningItems?: string[];

  @ApiPropertyOptional({
    example: ['Master Big-O analysis', 'Implement balanced trees and graphs from scratch'],
    description: 'Key learning outcomes ("What you will learn")',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional({
    example: ['Master Big-O analysis', 'Implement balanced trees and graphs from scratch'],
    description: 'Key learning outcomes ("What you will learn")',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn?: string[];

  @ApiPropertyOptional({
    example: 'Master core data structures and algorithm analysis techniques with hands-on practice.',
    description: 'Course description and syllabus overview',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'institution-uuid-12345',
    description: 'ID of the institution (leave empty for platform-wide course)',
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({
    example: 'college-uuid-12345',
    description: 'ID of the college (legacy alias)',
  })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
