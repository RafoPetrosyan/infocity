import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(6, { message: 'validation.min_password' })
  @IsNotEmpty({ message: 'validation.password_is_required' })
  password: string;

  @IsNotEmpty()
  token: string;
}
