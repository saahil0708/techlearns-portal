import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class Enable2faDto {
  @ApiProperty({ description: 'The generated base32 TOTP secret' })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({ description: 'The 6-digit TOTP verification code from Authenticator app' })
  @IsString()
  @Length(6, 6)
  token: string;

  @ApiProperty({ description: 'One-time backup recovery codes' })
  @IsArray()
  recoveryCodes: string[];
}

export class Verify2faDto {
  @ApiPropertyOptional({ description: 'Signed temporary 2FA challenge token received during login' })
  @IsString()
  @IsOptional()
  challengeToken?: string;

  @ApiProperty({ description: '6-digit TOTP code or 8-character backup recovery code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}


export class Disable2faDto {
  @ApiProperty({ description: '6-digit TOTP code to confirm disabling 2FA' })
  @IsString()
  @Length(6, 6)
  token: string;
}
