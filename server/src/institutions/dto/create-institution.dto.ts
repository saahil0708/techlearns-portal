import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateInstitutionDto {
  @ApiProperty({
    example: 'Massachusetts Institute of Technology',
    description: 'Name of the institution or university',
  })
  @IsString()
  @IsNotEmpty({ message: 'Institution name is required' })
  name: string;

  @ApiProperty({
    example: 'MIT',
    description: 'Unique uppercase institution identifier code',
  })
  @IsString()
  @IsNotEmpty({ message: 'Institution code is required' })
  code: string;

  @ApiPropertyOptional({
    example: 'contact@mit.edu',
    description: 'Official contact email',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '+1-617-253-1000',
    description: 'Official contact phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '77 Massachusetts Ave, Cambridge, MA 02139',
    description: 'Campus address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Enterprise Tier',
    description: 'Subscription tier of the institution',
  })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum student seat quota',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quota?: number;

  @ApiPropertyOptional({
    enum: InstitutionStatus,
    default: InstitutionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(InstitutionStatus)
  status?: InstitutionStatus;
}
