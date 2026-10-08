import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBatchDto {
  @ApiPropertyOptional({
    example: 'CS 2026 Batch A (Updated)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 30,
  })
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2027-05-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: ['faculty-uuid-1', 'faculty-uuid-2'],
    description: 'IDs of faculty mentors assigned to this batch',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facultyIds?: string[];
}
