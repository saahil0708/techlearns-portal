import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldSecurePass123!',
    description: 'Current account password for verification',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePass456!',
    description: 'New account password (minimum 8 characters with letters and numbers/symbols)',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*[^\w\s]))(?=.*[A-Za-z]).*$/, {
    message: 'New password must contain both letters and at least one number or special character',
  })
  newPassword: string;
}
