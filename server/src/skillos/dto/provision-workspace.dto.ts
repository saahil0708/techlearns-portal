import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProvisionWorkspaceDto {
  @ApiProperty({ description: 'Track code for corporate workspace', example: 'DEV', required: false })
  @IsOptional()
  @IsString()
  trackCode?: string;

  @ApiProperty({ description: 'GitHub username for org team invitation', example: 'octocat', required: false })
  @IsOptional()
  @IsString()
  githubUsername?: string;
}

export class UpdateSkillOsTelemetryDto {
  @ApiProperty({ description: 'Target corporate ID to update', example: 'TL-2026-DEV-S101', required: false })
  @IsOptional()
  @IsString()
  corporateId?: string;

  @ApiProperty({ description: 'Target user ID to update', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Increment PRs merged count', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  prsMergedDelta?: number;

  @ApiProperty({ description: 'Increment Jira story points burned', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  jiraPointsDelta?: number;

  @ApiProperty({ description: 'Direct passport score update (0-100)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passportScore?: number;
}
