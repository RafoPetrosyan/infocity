import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsEnum,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const MAX_EMOTIONS = 3;

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
  @ArrayMaxSize(MAX_EMOTIONS, {
    message: `You can add a maximum of ${MAX_EMOTIONS} emotions`,
  })
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


