import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryContactsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value) : 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}

