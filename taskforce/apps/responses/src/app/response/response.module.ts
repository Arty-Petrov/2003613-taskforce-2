import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqServiceName } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { ResponseController } from './response.controller';
import ResponseRepository from './response.repository';
import { ResponseService } from './response.service';

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

  controllers: [ResponseController],
  providers: [ResponseService, ResponseRepository],
})
export class ResponseModule {}
