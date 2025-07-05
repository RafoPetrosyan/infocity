import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LanguageEnum } from '../../../types';

export class CreateSubCategoryTranslationDto {
  @IsEnum(LanguageEnum, { message: 'language_must_be_valid_enum' })
  language: LanguageEnum;

  @IsString({ message: 'title_must_be_a_string' })
  @IsNotEmpty({ message: 'title_should_not_be_empty' })
  title: string;
}
