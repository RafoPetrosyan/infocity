import { Type, Transform, plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ItemTranslationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  place_section_id?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = 'AMD';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number = 0;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  en: ItemTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  hy: ItemTranslationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  ru: ItemTranslationDto;
}

export class UpdateItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  place_section_id?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  en?: ItemTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  hy?: ItemTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ItemTranslationDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ItemTranslationDto, parsed);
      } catch {
        return null;
      }
    }
    return plainToInstance(ItemTranslationDto, value);
  })
  ru?: ItemTranslationDto;
}
