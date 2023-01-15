import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Subscriber, Task } from '@taskforce/shared-types';
import { EmailSubject } from './mail.constant';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
  }

  public async sendNotifyNewSubscriber(subscriber: Subscriber) {
    await this.mailerService.sendMail({
      to: subscriber.email,
      subject: EmailSubject.AddSubscriber,
      template: './add-subscriber',
      context: {
        user: `${subscriber.name}`,
        email: `${subscriber.email}`,
      }
    })
  }

  public async sendNotifyNewTasks(subscribers: Subscriber[], tasks: Task[]) {
    for (const subscriber of subscribers){
      await this.mailerService.sendMail({
        to: subscriber.email,
        subject: EmailSubject.NewTasks,
        template: './new-tasks',
        context: {
          user: `${subscriber.name}`,
          tasks: tasks
        }
      });
    }
    return HttpStatus.NO_CONTENT;
  }
}
