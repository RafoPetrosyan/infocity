import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendContactRequestDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  receiver_id: number;
}

