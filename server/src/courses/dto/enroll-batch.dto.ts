import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollBatchDto {
  @ApiProperty({
    example: 'batch-uuid-12345',
    description: 'ID of the batch / cohort to enroll in this course',
  })
  @IsString()
  @IsNotEmpty({ message: 'batchId is required' })
  batchId: string;
}
