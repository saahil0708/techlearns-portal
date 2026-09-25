import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthDto {
  @ApiProperty({
    description: 'Firebase ID token received from client-side Google/GitHub popup sign-in',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Firebase ID token is required' })
  idToken!: string;

  @ApiPropertyOptional({
    description: 'OAuth provider name (google or github)',
    example: 'google',
  })
  @IsString()
  @IsOptional()
  provider?: string;
}
