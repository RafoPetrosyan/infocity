import { IsInt, ValidateIf } from 'class-validator';

export class ToggleLikeDto {
  @ValidateIf((o) => !o.reply_id)
  @IsInt()
  review_id?: number;

  @ValidateIf((o) => !o.review_id)
  @IsInt()
  reply_id?: number;
}

