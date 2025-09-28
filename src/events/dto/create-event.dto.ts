import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class EventTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  about: string;
}

export class CreateEventDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventTranslationDto, value);
  })
  en: EventTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventTranslationDto, value);
  })
  hy: EventTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(EventTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(EventTranslationDto, value);
  })
  ru: EventTranslationDto;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  place_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  event_category_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_attendees: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured: boolean;
}
