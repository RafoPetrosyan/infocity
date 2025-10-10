import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

export class GetMyReviewsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value) : 10))
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['place', 'event'])
  type?: 'place' | 'event';
}
