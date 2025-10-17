import { IsOptional, IsString, IsArray, IsInt, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsInt()
  @Type(() => Number)
  entity_id: number;

  @IsEnum(['place', 'event'])
  entity_type: 'place' | 'event';

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => Number(v.trim()));
    }

    if (Array.isArray(value)) {
      return value.map(Number);
    }

    return [];
  })
  emotion_ids?: number[];
}


