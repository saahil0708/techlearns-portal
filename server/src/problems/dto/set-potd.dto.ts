import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidCalendarDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCalendarDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
          const [yearStr, monthStr, dayStr] = value.split('-');
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);

          if (month < 1 || month > 12) return false;
          if (day < 1 || day > 31) return false;

          const dateObj = new Date(Date.UTC(year, month - 1, day));
          // Round-trip check: ensure date does not roll over (e.g. Feb 30 -> Mar 2)
          return (
            dateObj.getUTCFullYear() === year &&
            dateObj.getUTCMonth() === month - 1 &&
            dateObj.getUTCDate() === day
          );
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Date must be a valid calendar date in strict YYYY-MM-DD format';
        },
      },
    });
  };
}

export class SetPotdDto {
  @ApiProperty({ description: 'The unique problem ID to set as POTD' })
  @IsString()
  @IsNotEmpty()
  problemId: string;

  @ApiPropertyOptional({ description: 'Target date in strict YYYY-MM-DD format', example: '2026-09-22' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in strict YYYY-MM-DD format' })
  @IsValidCalendarDate({ message: 'Date must be a valid calendar date' })
  date?: string;

  @ApiPropertyOptional({ description: 'Bonus points awarded for solving POTD (1 - 500)', example: 50, default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  bonusPoints?: number;
}
