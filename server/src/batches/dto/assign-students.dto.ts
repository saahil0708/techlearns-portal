import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignStudentItemDto {
  @ApiProperty({ example: 'user-id-1', description: 'Student user ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'CS2026001', description: 'Student roll number or registration ID' })
  @IsOptional()
  @IsString()
  rollNo?: string;
}

export class AssignStudentsDto {
  @ApiPropertyOptional({
    example: ['user-id-1', 'user-id-2'],
    description: 'Array of student user IDs to assign to this batch',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    type: [AssignStudentItemDto],
    description: 'List of student assignment objects with optional roll numbers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignStudentItemDto)
  students?: AssignStudentItemDto[];
}
