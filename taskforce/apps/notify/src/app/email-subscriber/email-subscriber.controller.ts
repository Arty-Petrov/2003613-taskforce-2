import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandNotify, UserRole } from '@taskforce/shared-types';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { EmailSubscriberService } from './email-subscriber.service';

@Controller()
export class EmailSubscriberController {
  constructor(
    private readonly subscriberService: EmailSubscriberService,
  ) {}

  @EventPattern(
    createPattern(CommandNotify.AddSubscriber)
  )
  public async create(subscriber: CreateSubscriberDto) {
    return this.subscriberService.addSubscriber(subscriber);
  }

  @MessagePattern(
    createPattern(CommandNotify.GetSubscribers)
  )
  public async getRecipients(
    @Payload('role') role: UserRole = undefined
  ){
   return this.subscriberService.getSubscribersByRole(role);
  }
}
