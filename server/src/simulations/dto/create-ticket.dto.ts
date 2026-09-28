import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'PAY-8921' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Implement Idempotency Key Middleware for Stripe' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Payment Systems' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: 'P0 - Blocker', enum: ['P0 - Blocker', 'P1 - High', 'P2 - Medium'] })
  @IsString()
  @IsIn(['P0 - Blocker', 'P1 - High', 'P2 - Medium'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(13)
  @IsOptional()
  storyPoints?: number;

  @ApiPropertyOptional({ example: 'Backlog', enum: ['Backlog', 'In Progress', 'In Review', 'Merged'] })
  @IsString()
  @IsIn(['Backlog', 'In Progress', 'In Review', 'Merged'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '#142' })
  @IsString()
  @IsOptional()
  prNumber?: string;

  @ApiPropertyOptional({ example: 'Solid implementation of Redis lock' })
  @IsString()
  @IsOptional()
  techLeadFeedback?: string;

  @ApiProperty({ example: 'Avoid double billing by ensuring incoming webhooks check keys...' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ example: 'In Progress', enum: ['Backlog', 'In Progress', 'In Review', 'Merged'] })
  @IsString()
  @IsIn(['Backlog', 'In Progress', 'In Review', 'Merged'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '#143' })
  @IsString()
  @IsOptional()
  prNumber?: string;

  @ApiPropertyOptional({ example: 'Approved by lead' })
  @IsString()
  @IsOptional()
  techLeadFeedback?: string;

  @ApiPropertyOptional({ example: 'P1 - High', enum: ['P0 - Blocker', 'P1 - High', 'P2 - Medium'] })
  @IsString()
  @IsIn(['P0 - Blocker', 'P1 - High', 'P2 - Medium'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(13)
  @IsOptional()
  storyPoints?: number;
}

export class SubmitPrDto {
  @ApiProperty({ example: '#142' })
  @IsString()
  @IsNotEmpty()
  prNumber!: string;
}
