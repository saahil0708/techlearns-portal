import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BulkInviteItemDto {
  @ApiProperty({
    example: 'student@example.com',
    description: 'Email address of the invitee',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'Full name of the invitee',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.STUDENT,
    description: 'Role to assign to the invited user',
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role = Role.STUDENT;

  @ApiPropertyOptional({
    example: 'inst_123',
    description: 'Target Institution ID',
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({
    example: 'inst_123',
    description: 'Legacy alias for institutionId',
  })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({
    example: 'batch_456',
    description: 'Target Batch/Cohort ID',
  })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({
    example: 'CS2026-001',
    description: 'Student Roll Number / Identity Code',
  })
  @IsOptional()
  @IsString()
  rollNo?: string;
}

export class BulkInviteDto {
  @ApiProperty({
    type: [BulkInviteItemDto],
    description: 'Array of user invitations to dispatch',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkInviteItemDto)
  users: BulkInviteItemDto[];
}
