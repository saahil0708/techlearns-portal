import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QuizMCQDto {
  @ApiProperty({ example: 'What is the worst-case time complexity of QuickSort?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(1)'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 1, description: 'Zero-based index of correct option' })
  @IsInt()
  @Min(0)
  correctIndex: number;

  @ApiPropertyOptional({ example: 'QuickSort degrades to O(n^2) when poor pivots are chosen repeatedly.' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 'Consider when the array is already sorted and first element is pivot.' })
  @IsOptional()
  @IsString()
  hint?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  points?: number;
}

export class CodingProblemDto {
  @ApiPropertyOptional({ example: 'problem-uuid-1234', description: 'ID of an existing problem from the repository' })
  @IsOptional()
  @IsString()
  problemId?: string;

  @ApiPropertyOptional({ example: 'Two Sum Problem' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Find indices of two numbers that add up to target.' })
  @IsOptional()
  @IsString()
  statement?: string;

  @ApiPropertyOptional({
    example: { cpp: 'int solve() {}', python: 'def solve(): pass' },
    description: 'Boilerplate starter code per language',
  })
  @IsOptional()
  @IsObject()
  starterCode?: Record<string, string>;
}

export class CreateLessonDto {
  @ApiProperty({
    example: 'Introduction to Two-Pointer Techniques',
    description: 'Title of the lesson / sub-module',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lesson title is required' })
  title: string;

  @ApiPropertyOptional({
    example: '# Two-Pointer Approach\n\nWhen working with sorted arrays...',
    description: 'Markdown / HTML technical notes content of the lesson',
    default: '',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'reading',
    description: 'Modality type of the lesson: reading | quiz | code | guide | lab',
    default: 'reading',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Estimated completion time in minutes',
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    example: [
      'Two pointers reduce quadratic O(n^2) brute force searches into linear O(n) scans.',
      'Requires array to be pre-sorted or monotonic.',
    ],
    description: 'Important takeaways and summary highlights',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  importantNotes?: string[];

  @ApiPropertyOptional({
    description: 'Quiz question definition if lesson type is quiz',
    type: QuizMCQDto,
  })
  @IsOptional()
  @IsObject()
  quizMCQ?: QuizMCQDto;

  @ApiPropertyOptional({
    description: 'Coding practice problem definition if lesson type is code or lab',
    type: CodingProblemDto,
  })
  @IsOptional()
  @IsObject()
  codingProblem?: CodingProblemDto;

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
