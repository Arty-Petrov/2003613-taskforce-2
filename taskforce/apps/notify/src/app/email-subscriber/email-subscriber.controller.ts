import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandEvent, CommandMessage, UserRole } from '@taskforce/shared-types';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { EmailSubscriberService } from './email-subscriber.service';

@Controller()
export class EmailSubscriberController {
  constructor(
    private readonly subscriberService: EmailSubscriberService,
  ) {}

  @EventPattern(
    createPattern(CommandEvent.AddSubscriber)
  )
  public async create(subscriber: CreateSubscriberDto) {
    return this.subscriberService.addSubscriber(subscriber);
  }

  @MessagePattern(
    createPattern(CommandMessage.GetSubscribers)
  )
  public async getRecipients(
    @Payload('role') role: UserRole = undefined
  ){
   return this.subscriberService.getSubscribersByRole(role);
  }
}
