import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  ArrayMaxSize,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export enum NotificationCategory {
  CONTESTS = 'contests',
  SUBMISSIONS = 'submissions',
  COURSES = 'courses',
  CEL = 'cel',
  SYSTEM = 'system',
}

export class SendNotificationTargetDto {
  @ApiPropertyOptional({ description: 'Target specific institution / college ID' })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiPropertyOptional({ description: 'Target specific batch cohort ID' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({ description: 'Target specific course ID' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Target specific role, e.g. STUDENT or FACULTY', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;

  @ApiPropertyOptional({ description: 'Target specific list of user IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMaxSize(2000)
  userIds?: string[];
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Title of the push notification / announcement', example: 'Grand Arena Contest #109' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Body text content of the notification', example: 'Contest starts in 45 minutes. Register now!' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Notification category', enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory = NotificationCategory.SYSTEM;

  @ApiPropertyOptional({ description: 'Deep link / route to navigate when clicked', example: '/contests' })
  @IsOptional()
  @IsString()
  @Matches(/^\/(?![/\\])[^\s\\]*$/, {
    message: 'actionUrl must be a relative path starting with a single forward slash and without backslashes (e.g. /problems)',
  })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Target audience criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SendNotificationTargetDto)
  target?: SendNotificationTargetDto;
}
