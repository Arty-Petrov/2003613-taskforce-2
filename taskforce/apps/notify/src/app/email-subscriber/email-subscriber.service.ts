import { Injectable } from '@nestjs/common';
import { Subscriber, UserRole } from '@taskforce/shared-types';
import { MailService } from '../mail/mail.service';
import { EmailSubscriberRepository } from './email-subscriber.repository';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { EmailSubscriberApiError } from './email-subscriber.constant';
import { EmailSubscriberEntity } from './email-subscriber.entity';

@Injectable()
export class EmailSubscriberService {
  constructor(
    private readonly emailSubscriberRepository: EmailSubscriberRepository,
    private readonly mailService: MailService,
  ) {}

  public async addSubscriber(subscriber: CreateSubscriberDto) {
    const { email } = subscriber;
    const existsSubscriber = await this.emailSubscriberRepository.findByEmail(email);

    if (existsSubscriber) {
      throw new Error(EmailSubscriberApiError.EmailSubscriberExists);
    }

    await this.mailService.sendNotifyNewSubscriber(subscriber);

    return this.emailSubscriberRepository
      .create(new EmailSubscriberEntity(subscriber));
  }

  public async getSubscribersByRole(userRole: UserRole = undefined): Promise<Subscriber[]> {
    return this.emailSubscriberRepository.findByRole(userRole);
  }
}
