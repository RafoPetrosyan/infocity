import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({
    description:
      'JSON string of translation objects. Each object has language and name.',
    example:
      '[{"language":"en","name":"Cafes"},{"language":"hy","name":"Սրճարաններ"},{"language":"ru","name":"Кафе"}]',
  })
  @IsString()
  translations: string;
}
