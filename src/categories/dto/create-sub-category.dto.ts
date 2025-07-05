import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubCategoryTranslationDto } from './create-sub-category-translations.dto';

export class CreateSubCategoryDto {
  @IsString({ message: 'slug_must_be_a_string' })
  @IsNotEmpty({ message: 'slug_should_not_be_empty' })
  slug: string;

  @IsArray({ message: 'translations_must_be_an_array' })
  @ValidateNested({ each: true, message: 'invalid_translation_item' })
  @Type(() => CreateSubCategoryTranslationDto)
  translations: CreateSubCategoryTranslationDto[];
}
