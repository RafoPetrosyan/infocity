import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PlaceSectionTranslationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePlaceSectionDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  en: PlaceSectionTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  hy: PlaceSectionTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  ru: PlaceSectionTranslationDto;
}

export class UpdatePlaceSectionDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  en?: PlaceSectionTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  hy?: PlaceSectionTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceSectionTranslationDto)
  ru?: PlaceSectionTranslationDto;
}
