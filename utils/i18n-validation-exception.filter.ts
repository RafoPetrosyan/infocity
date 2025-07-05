import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();
    const lang = request.i18nLang || 'en';

    let message: any = responseBody?.message;

    if (
      responseBody &&
      typeof responseBody === 'object' &&
      'key' in responseBody
    ) {
      message = await this.i18n.t(responseBody.key, {
        lang,
        args: responseBody.args || {},
      });
    }

    // If message is a string and looks like a translation key
    if (typeof message === 'string' && message.startsWith('validation.')) {
      try {
        message = await this.i18n.t(message, { lang });
      } catch {
        // fallback if translation not found
      }
    }

    // If it's a validation error (array of ValidationError objects)
    if (Array.isArray(message) && message[0]?.constraints) {
      const fieldErrors: Record<string, string> = {};

      for (const error of message) {
        const field = error.property;
        const firstKey = Object.keys(error.constraints)[0];
        const translationKey = error.constraints[firstKey];
        if (!fieldErrors[field]) {
          fieldErrors[field] = await this.i18n.t(translationKey, { lang });
        }
      }

      message = fieldErrors;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: responseBody?.error || exception.name,
    });
  }
}
