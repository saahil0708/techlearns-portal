import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export enum StorageFolder {
  AVATARS = 'avatars',
  INSTITUTIONS = 'institutions',
  COURSES = 'courses',
  BLOGS = 'blogs',
  PROBLEMS = 'problems',
  ATTACHMENTS = 'attachments',
}

export class GenerateSasUrlDto {
  @ApiProperty({ description: 'Original file name including extension', example: 'avatar.png' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'MIME content type of the file', example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({ enum: StorageFolder, description: 'Target folder partition in Azure container', example: StorageFolder.AVATARS })
  @IsEnum(StorageFolder)
  folder: StorageFolder;

  @ApiProperty({ required: false, description: 'Custom identifier (e.g. course slug, user id)', example: 'user-123' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]{1,64}$/, {
    message: 'entityId must contain only 1-64 alphanumeric characters, underscores, or hyphens',
  })
  entityId?: string;
}
