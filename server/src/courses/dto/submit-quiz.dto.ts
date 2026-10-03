import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SubmitQuizDto {
  @ApiProperty({ example: 1, description: 'Zero-based index of the chosen option' })
  @IsNumber()
  @IsNotEmpty()
  selectedOption!: number;
}
