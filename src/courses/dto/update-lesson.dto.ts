import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    example: 'Two-Pointer Technique Deep Dive',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated lesson content...',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
