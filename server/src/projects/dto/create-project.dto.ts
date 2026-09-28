import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProjectMilestoneDto {
  @ApiProperty({ example: 'Leader Election & Term State Machine' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Phase 1' })
  @IsString()
  @IsOptional()
  phase?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  done?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Distributed In-Memory Key-Value Store with Raft' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Distributed Systems' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Advanced', enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @IsString()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ example: 'In Progress', enum: ['In Progress', 'Completed', 'Available'] })
  @IsString()
  @IsIn(['In Progress', 'Completed', 'Available'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 75 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progressPct?: number;

  @ApiPropertyOptional({ example: ['Go 1.22', 'Raft Consensus', 'gRPC'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techStack?: string[];

  @ApiPropertyOptional({ example: 'kv' })
  @IsString()
  @IsOptional()
  iconType?: string;

  @ApiPropertyOptional({ example: '#7C3AED' })
  @IsString()
  @IsOptional()
  accentColor?: string;

  @ApiPropertyOptional({ example: '#F5F3FF' })
  @IsString()
  @IsOptional()
  bgColor?: string;

  @ApiPropertyOptional({ example: 'https://github.com/student/distributed-kv-raft' })
  @IsString()
  @IsOptional()
  repoUrl?: string;

  @ApiPropertyOptional({ example: 'https://kv-raft.sandbox.techlearns.io' })
  @IsString()
  @IsOptional()
  liveUrl?: string;

  @ApiProperty({ example: 'Leader election, log replication, snapshotting...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: [':8080 HTTP', ':9090 gRPC'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ports?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  services?: any;

  @ApiPropertyOptional({ example: ['[RAFT-CORE] Initializing cluster...'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  terminalLogs?: string[];

  @ApiPropertyOptional({ type: [CreateProjectMilestoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectMilestoneDto)
  @IsOptional()
  milestones?: CreateProjectMilestoneDto[];
}

export class ToggleMilestoneDto {
  @ApiPropertyOptional({ example: true, description: 'Target boolean status for milestone completion' })
  @IsBoolean()
  @IsOptional()
  done?: boolean;
}
