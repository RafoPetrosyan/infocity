import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @Length(1, 50)
  slug: string;

  @IsNotEmpty()
  translations: { language: string; name: string }[];
}
