import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Data Structures and Algorithms in C++',
    description: 'Title of the course',
  })
  @IsString()
  @IsNotEmpty({ message: 'Course title is required' })
  title: string;

  @ApiPropertyOptional({
    example: 'Master core data structures and algorithm analysis techniques.',
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
