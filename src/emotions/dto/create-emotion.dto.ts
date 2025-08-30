import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateEmotionDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  icon?: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  color?: string;

  // translations will come as array
  @IsNotEmpty()
  translations: { language: string; name: string }[];
}
