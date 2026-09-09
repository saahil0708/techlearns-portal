import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    example: true,
    description: 'Whether the lesson has been completed by the student',
  })
  @IsBoolean()
  completed: boolean;
}
