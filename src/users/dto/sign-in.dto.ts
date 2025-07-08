import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;

  @MinLength(6, { message: 'validation.min_password' })
  @IsNotEmpty({ message: 'validation.password_is_required' })
  password: string;
}
