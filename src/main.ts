import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nService } from 'nestjs-i18n';
import { I18nValidationExceptionFilter } from '../utils/i18n-validation-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const i18n = app.get(I18nService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    }),
  );
  // @ts-ignore
  app.useGlobalFilters(new I18nValidationExceptionFilter(i18n));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
