import { ApiPropertyOptional } from '@nestjs/swagger';
import { CollegeStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCollegeDto {
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
    enum: CollegeStatus,
  })
  @IsOptional()
  @IsEnum(CollegeStatus)
  status?: CollegeStatus;
}
