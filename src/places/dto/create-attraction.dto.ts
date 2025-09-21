import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

enum Platforms {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  WEBSITE = 'website',
}

export class PlaceTranslationDto {
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

export class PlaceSocialLinksDto {
  @IsNotEmpty()
  @IsEnum(Platforms)
  platform: Platforms;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class CreateAttractionDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(PlaceTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(PlaceTranslationDto, value);
  })
  en: PlaceTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(PlaceTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(PlaceTranslationDto, value);
  })
  hy: PlaceTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(PlaceTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(PlaceTranslationDto, value);
  })
  ru: PlaceTranslationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceSocialLinksDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return [];

        return plainToInstance(PlaceSocialLinksDto, parsed);
      } catch {
        return [];
      }
    }
    return plainToInstance(PlaceSocialLinksDto, value);
  })
  social_links: PlaceSocialLinksDto[];

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

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  city_id: number;

  @IsOptional()
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  address: string;
}
