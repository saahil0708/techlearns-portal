import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { IsValidCalendarDate } from './set-potd.dto.js';

export class QueuePotdDto {
  @ApiProperty({
    description: 'Ordered array of problem IDs to assign to consecutive days',
    type: [String],
    example: ['prob-id-1', 'prob-id-2', 'prob-id-3'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one problem ID must be provided' })
  @ArrayMaxSize(60, { message: 'Cannot queue more than 60 days in a single batch' })
  @IsString({ each: true, message: 'Each problem ID must be a string' })
  problemIds: string[];

  @ApiPropertyOptional({
    description: 'Start date for continuous queue in strict YYYY-MM-DD format (defaults to today)',
    example: '2026-10-06',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in strict YYYY-MM-DD format' })
  @IsValidCalendarDate({ message: 'Start date must be a valid calendar date' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Bonus points awarded per POTD solve (1 - 500)',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  bonusPoints?: number;
}
