import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewReplyDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsInt()
  @Type(() => Number)
  review_id: number;
}

