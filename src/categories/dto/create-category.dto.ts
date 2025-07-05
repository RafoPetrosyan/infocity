import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubCategoryDto } from './create-sub-category.dto';
import { CreateCategoryTranslationDto } from './create-category-translations.dto';

export class CreateCategoryDto {
  @IsString({ message: 'validation.slug_must_be_a_string' })
  @IsNotEmpty({ message: 'validation.slug_should_not_be_empty' })
  slug: string;

  @IsArray({ message: 'validation.translations_must_be_an_array' })
  @ValidateNested({
    each: true,
    message: 'validation.invalid_translation_item',
  })
  @Type(() => CreateCategoryTranslationDto)
  translations: CreateCategoryTranslationDto[];

  @IsOptional()
  @IsArray({ message: 'validation.sub_categories_must_be_an_array' })
  @ValidateNested({
    each: true,
    message: 'validation.invalid_sub_category_item',
  })
  @Type(() => CreateSubCategoryDto)
  sub_categories: CreateSubCategoryDto[];
}
