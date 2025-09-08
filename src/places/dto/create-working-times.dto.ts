import {
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

enum Weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

const ALL_WEEKDAYS = Object.values(Weekday);

// Custom validator to check uniqueness + completeness
export function IsCompleteWeek(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCompleteWeek',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const days = value.map((v) => v.weekday);

          // check duplicates
          const uniqueDays = new Set(days);
          if (uniqueDays.size !== days.length) return false;

          // check completeness (all 7 days present)
          return ALL_WEEKDAYS.every((day) => uniqueDays.has(day));
        },
        defaultMessage(args: ValidationArguments) {
          return `Working times must include all 7 weekdays (monday-sunday) with no duplicates.`;
        },
      },
    });
  };
}

class BreakDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class CreateWorkingTimeDto {
  @IsEnum(Weekday)
  weekday: Weekday;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsBoolean()
  is_working_day?: boolean = true;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  breaks?: BreakDto[];
}

export class CreateWorkingTimesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkingTimeDto)
  @IsCompleteWeek()
  working_times: CreateWorkingTimeDto[];
}
