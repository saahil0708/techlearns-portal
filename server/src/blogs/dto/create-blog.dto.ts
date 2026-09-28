import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Designing a Real-Time Distributed Leaderboard' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Deep dive into Redis Sorted Sets & BullMQ' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'System Architecture' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '7 min read' })
  @IsString()
  @IsOptional()
  readTime?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ example: '## Architecture Overview...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: ['Redis', 'DistributedSystems', 'BullMQ'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Published', enum: ['Published', 'Draft', 'Archived'] })
  @IsString()
  @IsIn(['Published', 'Draft', 'Archived'])
  @IsOptional()
  status?: string;
}

export class CreateBlogCommentDto {
  @ApiProperty({ example: 'Great article on Redis ZSET mechanics!' })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
