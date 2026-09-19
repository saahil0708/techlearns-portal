import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const INSTITUTION_ROLES = [Role.INSTITUTION_ADMIN, Role.FACULTY, Role.STUDENT] as const;

export class AddMemberDto {
  @ApiProperty({
    example: 'user-uuid-12345',
    description: 'Unique ID of the user to add to the institution',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    enum: INSTITUTION_ROLES,
    example: Role.STUDENT,
    description: 'Role of the member in this institution',
  })
  @IsEnum(INSTITUTION_ROLES, { message: 'Valid institution role is required' })
  role: (typeof INSTITUTION_ROLES)[number];
}
