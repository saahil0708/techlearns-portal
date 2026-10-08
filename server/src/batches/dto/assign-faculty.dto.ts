import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class AssignFacultyDto {
  @ApiProperty({
    example: ['user-uuid-1', 'user-uuid-2'],
    description: 'Array of faculty user IDs to assign to this batch',
  })
  @IsArray()
  @IsString({ each: true })
  facultyIds: string[];

  @ApiProperty({
    example: 'MENTOR',
    required: false,
    description: 'Role of faculty mentor (LEAD, MENTOR, COORDINATOR, INSTRUCTOR)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
