import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class EventCategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class CreateEventCategoryDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventCategoryTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventCategoryTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventCategoryTranslationDto, value);
  })
  en: EventCategoryTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventCategoryTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventCategoryTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventCategoryTranslationDto, value);
  })
  hy: EventCategoryTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventCategoryTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventCategoryTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventCategoryTranslationDto, value);
  })
  ru: EventCategoryTranslationDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;
}
