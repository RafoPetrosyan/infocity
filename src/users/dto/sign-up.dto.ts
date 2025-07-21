import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;

  @MinLength(6, { message: 'validation.min_password' })
  @IsNotEmpty({ message: 'validation.password_is_required' })
  password: string;

  @IsNotEmpty({ message: 'validation.first_name_is_required' })
  first_name: string;

  @IsNotEmpty({ message: 'validation.last_name_is_required' })
  last_name: string;
}
