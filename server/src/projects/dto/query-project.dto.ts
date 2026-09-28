import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryProjectDto {
  @ApiPropertyOptional({ example: 'Raft' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'Distributed Systems' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'In Progress' })
  @IsString()
  @IsOptional()
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
