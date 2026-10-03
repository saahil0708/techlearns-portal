import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryBlogDto {
  @ApiPropertyOptional({ example: 'Architecture' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'System Architecture' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Published', enum: ['Published', 'Draft', 'Archived'] })
  @IsString()
  @IsOptional()
  @IsIn(['Published', 'Draft', 'Archived'])
  status?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
