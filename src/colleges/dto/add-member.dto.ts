import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    example: 'user-uuid-12345',
    description: 'Unique ID of the user to add to the college',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    enum: [Role.COLLEGE_ADMIN, Role.FACULTY, Role.STUDENT],
    example: Role.STUDENT,
    description: 'Role of the member in this college',
  })
  @IsEnum(Role, { message: 'Valid college role is required' })
  role: Role;
}
