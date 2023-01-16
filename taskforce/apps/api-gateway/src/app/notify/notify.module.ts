import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqService } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RmqService.Notify,
        useFactory: getRabbitMqConfig.Notify,
        inject: [ConfigService]
      },
      {
        name: RmqService.Tasks,
        useFactory: getRabbitMqConfig.Tasks,
        inject: [ConfigService]
      },
    ]),
  ],
  controllers:[NotifyController],
  providers: [NotifyService]
})
export class NotifyModule {}
