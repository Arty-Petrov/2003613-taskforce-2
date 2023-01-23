import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RmqServiceName } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { TaskCategoryModule } from '../task-category/task-category.module';
import { TaskTagModule } from '../task-tag/task-tag.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [
    TaskCategoryModule,
    TaskTagModule,
    ClientsModule.registerAsync([
      {
        name: RmqServiceName.Auth,
        useFactory: getRabbitMqConfig.Auth,
        inject: [ConfigService]
      },
      {
        name: RmqServiceName.Comments,
        useFactory: getRabbitMqConfig.Comments,
        inject: [ConfigService]
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class TaskModule {}
