import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

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
}
