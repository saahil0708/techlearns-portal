import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user to create',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Initial password for the user (min 8 characters)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.STUDENT,
    description: 'Global system role to assign',
  })
  @IsOptional()
  @IsEnum(Role)
  globalRole?: Role = Role.STUDENT;

  @ApiPropertyOptional({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    description: 'Account activation status',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus = UserStatus.ACTIVE;

  @ApiPropertyOptional({
    example: 'cuid1234567890',
    description: 'Associated Institution ID',
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({
    example: 'cuid1234567890',
    description: 'Legacy alias for institutionId',
  })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({
    example: 'sedgewick_cs',
    description: 'Unique username / handle / student roll number',
  })
  @IsOptional()
  @IsString()
  rollNo?: string;

  @ApiPropertyOptional({
    example: 'sedgewick_cs',
    description: 'Username / handle alias',
  })
  @IsOptional()
  @IsString()
  handle?: string;

  @ApiPropertyOptional({
    example: 'sedgewick_cs',
    description: 'Username alias',
  })
  @IsOptional()
  @IsString()
  username?: string;
}
