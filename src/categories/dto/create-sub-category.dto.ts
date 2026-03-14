import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class SubCategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateSubCategoryDto {
  @IsString()
  @Length(1, 50)
  slug: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @IsString()
  translations: string;
}
