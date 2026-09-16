import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({
    example: 'CS 2026 Batch A',
    description: 'Name of the cohort or batch',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'inst-uuid-12345',
    description: 'ID of the institution this batch belongs to',
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({
    example: 'college-uuid-12345',
    description: 'ID of the institution this batch belongs to (legacy alias)',
  })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Maximum student capacity for this cohort/batch',
  })
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Status of the cohort or batch',
  })
  @IsOptional()
  @IsString()
  status?: string;

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
