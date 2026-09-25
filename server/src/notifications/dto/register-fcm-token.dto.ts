import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'Firebase Cloud Messaging (FCM) registration device token' })
  @IsNotEmpty()
  @IsString()
  fcmToken: string;
}
