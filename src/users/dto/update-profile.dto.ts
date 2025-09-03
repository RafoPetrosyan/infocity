import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SupportedLocales } from './sign-up.dto';
import { Transform, Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsNotEmpty({ message: 'validation.first_name_is_required' })
  first_name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'validation.last_name_is_required' })
  last_name: string;

  @IsOptional()
  @IsString()
  fcm_token: string;

  @IsOptional()
  @IsEnum(SupportedLocales)
  locale: SupportedLocales;

  @IsOptional()
  @IsString()
  phone_number: string;

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
  @Type(() => Number)
  @IsInt()
  city_id: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => Number(v));
    }
    return [];
  })
  @IsArray()
  @IsInt({ each: true })
  emotion_ids: number[];
}
