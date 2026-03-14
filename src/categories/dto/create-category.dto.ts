import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

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
  @IsOptional()
  @Length(1, 50)
  icon?: string;

  @IsString()
  translations: string;
}
