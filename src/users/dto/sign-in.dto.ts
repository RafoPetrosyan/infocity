import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;

  @IsNotEmpty({ message: 'validation.password_is_required' })
  password: string;
}
