import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const COLLEGE_ROLES = [Role.COLLEGE_ADMIN, Role.FACULTY, Role.STUDENT] as const;

export class AddMemberDto {
  @ApiProperty({
    example: 'user-uuid-12345',
    description: 'Unique ID of the user to add to the college',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    enum: COLLEGE_ROLES,
    example: Role.STUDENT,
    description: 'Role of the member in this college',
  })
  @IsEnum(COLLEGE_ROLES, { message: 'Valid college role is required' })
  role: (typeof COLLEGE_ROLES)[number];
}
