import { IsNotEmpty, IsString } from 'class-validator';

export class SocialSignInDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}