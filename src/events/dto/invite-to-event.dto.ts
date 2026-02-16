import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class InviteToEventDto {
  @Type(() => Number)
  @IsInt()
  invitee_id: number;
}
