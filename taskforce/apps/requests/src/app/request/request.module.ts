import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqServiceName } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { RequestController } from './request.controller';
import RequestRepository from './request.repository';
import { RequestService } from './request.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RmqServiceName.Auth,
        useFactory: getRabbitMqConfig.Auth,
        inject: [ConfigService]
      },
      {
        name: RmqServiceName.Tasks,
        useFactory: getRabbitMqConfig.Tasks,
        inject: [ConfigService]
      },
    ]),
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestRepository],
})
export class RequestModule {}
