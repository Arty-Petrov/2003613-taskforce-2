import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqServiceName } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RmqServiceName.Auth,
        useFactory: getRabbitMqConfig.Auth,
        inject: [ConfigService]
      },
      {
        name: RmqServiceName.Notify,
        useFactory: getRabbitMqConfig.Notify,
        inject: [ConfigService]
      },
      {
        name: RmqServiceName.Tasks,
        useFactory: getRabbitMqConfig.Tasks,
        inject: [ConfigService]
      },
    ]),
  ],
  controllers:[NotifyController],
  providers: [NotifyService]
})
export class NotifyModule {}
