import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CompositeModuleDto } from './create-composite-course.dto.js';

export enum BulkImportMode {
  APPEND = 'append',
  REPLACE = 'replace',
}

export class BulkImportCurriculumDto {
  @ApiPropertyOptional({
    enum: BulkImportMode,
    default: BulkImportMode.APPEND,
    description: 'Whether to append new modules to existing course or replace all existing modules',
  })
  @IsOptional()
  @IsEnum(BulkImportMode)
  mode?: BulkImportMode;

  @ApiProperty({
    type: [CompositeModuleDto],
    description: 'Array of modules with submodules, lessons, notes, and quiz/coding problems',
  })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CompositeModuleDto)
  modules: CompositeModuleDto[];
}
