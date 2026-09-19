import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PasskeyRegistrationVerifyDto {
  @ApiProperty({ description: 'WebAuthn PublicKeyCredential registration response JSON object' })
  @IsObject()
  @IsNotEmpty()
  response: any;

  @ApiPropertyOptional({ description: 'Friendly device name (e.g. YubiKey 5C NFC, MacBook Touch ID)' })
  @IsString()
  @IsOptional()
  deviceName?: string;
}

export class PasskeyLoginChallengeDto {
  @ApiPropertyOptional({ description: 'Optional email for non-discoverable passkey credentials' })
  @IsString()
  @IsOptional()
  email?: string;
}

export class PasskeyLoginVerifyDto {
  @ApiProperty({ description: 'WebAuthn PublicKeyCredential authentication response JSON object' })
  @IsObject()
  @IsNotEmpty()
  response: any;

  @ApiProperty({ description: 'The challenge session key received from login challenge generation' })
  @IsString()
  @IsNotEmpty()
  challengeKey: string;
}
