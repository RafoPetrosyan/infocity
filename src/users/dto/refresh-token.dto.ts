import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'validation.token_must_be_a_string' })
  @IsNotEmpty({ message: 'validation.token_should_not_be_empty' })
  refresh_token: string;
}
