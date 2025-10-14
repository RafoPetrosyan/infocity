import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class AcceptContactRequestDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  request_id: number;
}

