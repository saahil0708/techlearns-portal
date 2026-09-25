import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBootcampProgressDto {
  @ApiProperty({ example: 65, description: 'Percentage progress completed (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct!: number;

  @ApiPropertyOptional({ example: 8, description: 'Number of sessions completed' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sessionsCompleted?: number;
}
