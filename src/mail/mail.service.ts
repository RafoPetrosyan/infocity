import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LanguageEnum } from '../../types';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly i18n: I18nService,
  ) {}

  async sendVerificationEmail(email: string, code: string, lang: LanguageEnum) {
    const subject = (await this.i18n.translate(
      'validation.verification_subject',
      {
        lang,
      },
    )) as string;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `./${lang || 'en'}/verification`,
      context: {
        code,
        email,
      },
    });
  }

  async sendSimpleEmail(email: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      text,
    });
  }
}
