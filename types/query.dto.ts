import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsInt()
  section_id?: number;
}
