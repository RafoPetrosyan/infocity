import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'invalid_email_format' })
  email: string;

  @MinLength(6, { message: 'min_password' })
  @IsNotEmpty({ message: 'password_is_required' })
  password: string;
}
