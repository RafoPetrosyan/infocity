import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateReviewReplyDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

