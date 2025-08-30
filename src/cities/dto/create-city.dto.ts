import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @Length(1, 50)
  slug: string;

  @IsNotEmpty()
  translations: { language: string; name: string }[];
}

// @IsOptional()
// @IsArray({ message: 'validation.sub_categories_must_be_an_array' })
// @ValidateNested({
//   each: true,
//   message: 'validation.invalid_sub_category_item',
// })
