import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateCategoryDto {
  @IsString()
  @Length(1, 50)
  slug: string;

  @IsString()
  translations: string;
}
