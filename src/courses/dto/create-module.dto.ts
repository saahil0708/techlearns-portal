import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    example: 'Arrays, Vectors, and Sliding Windows',
    description: 'Title of the course module',
  })
  @IsString()
  @IsNotEmpty({ message: 'Module title is required' })
  title: string;

  @ApiPropertyOptional({
    example: 'Foundational array operations and two-pointer techniques.',
    description: 'Description of module contents',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order index of this module',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
