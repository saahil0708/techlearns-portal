import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignStudentsDto {
  @ApiProperty({
    example: ['user-id-1', 'user-id-2'],
    description: 'Array of student user IDs to assign to this batch',
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one student ID must be provided' })
  @IsString({ each: true })
  userIds: string[];
}
