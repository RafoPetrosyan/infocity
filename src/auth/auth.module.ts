import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { config as dotenvConfig } from 'dotenv';
import { JWT_DEFAULT_EXPIRATION } from '../../constants';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: JWT_DEFAULT_EXPIRATION },
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
