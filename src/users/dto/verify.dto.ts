import { IsNotEmpty } from 'class-validator';

export class VerifyDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  token: string;
}
