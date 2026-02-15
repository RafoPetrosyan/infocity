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

  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @IsString()
  translations: string;
}
