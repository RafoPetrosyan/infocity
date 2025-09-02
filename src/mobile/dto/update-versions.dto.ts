import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateVersionsDto {
  @IsString()
  @IsNotEmpty()
  ios_version: string;

  @IsString()
  @IsNotEmpty()
  android_version: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  force_update: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  app_working: boolean;
}
