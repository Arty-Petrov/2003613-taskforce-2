import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { getMailConfig } from '../../config/mail.config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync(getMailConfig())
  ],
  controllers: [
    MailController
  ],
  providers: [
    MailService
  ],
  exports: [
    MailService
  ]
})
export class MailModule {}
