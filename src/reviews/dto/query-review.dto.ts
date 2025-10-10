import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryReviewDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  entity_id?: number;

  @IsOptional()
  @IsEnum(['place', 'event'])
  entity_type?: 'place' | 'event';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;
}
