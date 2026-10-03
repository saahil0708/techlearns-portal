import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkillItemDto {
  @ApiProperty({ example: 'prog' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Programming & Logic' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 85 })
  @IsNumber()
  level!: number;

  @ApiProperty({ example: 'Advanced' })
  @IsString()
  @IsNotEmpty()
  label!: string;
}

export class SaveDiagnosticDto {
  @ApiProperty({ example: 'Full-Stack Web Architect' })
  @IsString()
  @IsNotEmpty()
  targetTrack!: string;

  @ApiProperty({ example: 'fullstack' })
  @IsString()
  @IsNotEmpty()
  targetTrackId!: string;

  @ApiProperty({ example: '6 months (Standard)' })
  @IsString()
  @IsNotEmpty()
  timeline!: string;

  @ApiProperty({ example: 14 })
  @IsNumber()
  weeklyHours!: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  roleFitScore!: number;

  @ApiPropertyOptional({ example: '8/10' })
  @IsOptional()
  @IsString()
  quizScore?: string;

  @ApiProperty({ type: [SkillItemDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills!: SkillItemDto[];
}
