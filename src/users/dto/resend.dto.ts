import { IsNotEmpty } from 'class-validator';

export class ResendDto {
  @IsNotEmpty()
  token: string;
}
