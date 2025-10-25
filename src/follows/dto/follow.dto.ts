import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FollowDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  id: number;

  @IsEnum(['place', 'event'])
  type: 'place' | 'event';
}

export class GetFollowsDto {
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



