import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'validation.invalid_email_format' })
  email: string;
}
