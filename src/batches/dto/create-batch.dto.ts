import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({
    example: 'CS 2026 Batch A',
    description: 'Name of the cohort or batch',
  })
  @IsString()
  @IsNotEmpty({ message: 'Batch name is required' })
  name: string;

  @ApiProperty({
    example: 'college-uuid-12345',
    description: 'ID of the college this batch belongs to',
  })
  @IsString()
  @IsNotEmpty({ message: 'College ID is required' })
  collegeId: string;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Batch start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2027-05-30T00:00:00.000Z',
    description: 'Batch end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
