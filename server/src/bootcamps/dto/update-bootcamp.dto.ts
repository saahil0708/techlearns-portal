import { PartialType } from '@nestjs/swagger';
import { CreateBootcampDto } from './create-bootcamp.dto.js';

export class UpdateBootcampDto extends PartialType(CreateBootcampDto) {}
