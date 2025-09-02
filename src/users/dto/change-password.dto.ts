import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @MinLength(6, { message: 'validation.min_password' })
  @IsNotEmpty({ message: 'validation.password_is_required' })
  password: string;

  @MinLength(6, { message: 'validation.min_password' })
  @IsNotEmpty({ message: 'validation.password_is_required' })
  old_password: string;
}
