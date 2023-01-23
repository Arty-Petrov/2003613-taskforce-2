import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqServiceName } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { CommentController } from './comment.controller';
import CommentRepository from './comment.repository';
import { CommentService } from './comment.service';

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
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
