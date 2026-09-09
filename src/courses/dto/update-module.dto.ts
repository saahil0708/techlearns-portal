import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateModuleDto {
  @ApiPropertyOptional({
    example: 'Arrays & Dynamic Vectors',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
