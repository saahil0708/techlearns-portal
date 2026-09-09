import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    example: 'Introduction to Two-Pointer Techniques',
    description: 'Title of the lesson',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lesson title is required' })
  title: string;

  @ApiProperty({
    example: '# Two-Pointer Approach\n\nWhen working with sorted arrays...',
    description: 'Markdown content of the lesson',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lesson content is required' })
  content: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order index of this lesson inside the module',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
