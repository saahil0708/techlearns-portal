import { ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInstitutionDto {
  @ApiPropertyOptional({
    example: 'MIT School of Engineering',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'info@mit.edu',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '+1-617-253-1000',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Cambridge, MA',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Enterprise Tier',
  })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quota?: number;

  @ApiPropertyOptional({
    enum: InstitutionStatus,
  })
  @IsOptional()
  @IsEnum(InstitutionStatus)
  status?: InstitutionStatus;
}
