import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Cryptographic refresh token (optional if sent via httpOnly cookie)' })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'Device information / User-Agent' })
  @IsString()
  @IsOptional()
  deviceInfo?: string;
}

export class RevokeTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token to revoke (optional if sent via httpOnly cookie)' })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

