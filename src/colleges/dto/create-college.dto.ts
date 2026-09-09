import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CollegeStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollegeDto {
  @ApiProperty({
    example: 'Massachusetts Institute of Technology',
    description: 'Name of the college or university',
  })
  @IsString()
  @IsNotEmpty({ message: 'College name is required' })
  name: string;

  @ApiProperty({
    example: 'MIT',
    description: 'Unique uppercase college identifier code',
  })
  @IsString()
  @IsNotEmpty({ message: 'College code is required' })
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
    enum: CollegeStatus,
    default: CollegeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CollegeStatus)
  status?: CollegeStatus;
}
