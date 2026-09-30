import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nService } from 'nestjs-i18n';
import { I18nValidationExceptionFilter } from '../utils/i18n-validation-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3004',
      'http://80.241.210.91:3001',
      'http://80.241.210.91:3002',
      'https://imcity.am',
      'https://admin.imcity.am',
    ],
    credentials: true,
  });

  const i18n = app.get(I18nService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    }),
  );
  // @ts-ignore
  app.useGlobalFilters(new I18nValidationExceptionFilter(i18n));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Infocity API')
    .setDescription(
      'HTTP API for Infocity. Authenticated routes use a JWT access token (Authorization: Bearer). Pass lang, locale, or x-language-code to select en, hy, or ru. The Accept-Language header is used when no language query is present.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'bearer',
    )
    .addGlobalParameters({
      name: 'lang',
      in: 'query',
      required: false,
      description:
        'Response language. Aliases: locale, x-language-code. Falls back to the Accept-Language header, then en.',
      schema: {
        type: 'string',
        enum: ['en', 'hy', 'ru'],
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
