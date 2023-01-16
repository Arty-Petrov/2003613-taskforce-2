import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandMessage, Subscriber } from '@taskforce/shared-types';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(
    private readonly mailService: MailService,
  ) {}
  @MessagePattern(createPattern(
    CommandMessage.SendNewTasks
    )
  )
  public async notifyNewTasks(
    @Payload('subscribers') subscribers: Subscriber[],
    @Payload('tasks') tasks){
    return this.mailService.sendNotifyNewTasks(subscribers, tasks);
  }
}
