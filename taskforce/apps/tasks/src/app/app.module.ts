import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { TASKS_SERVICE_ENV_PATH } from './app.constant';
import { validateEnvironments } from './env.valitation';
import { PrismaModule } from './prisma/prisma.module';
import { TaskCategoryModule } from './task-category/task-category.module';
import { TaskTagModule } from './task-tag/task-tag.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    cache: true,
    isGlobal: true,
    envFilePath: TASKS_SERVICE_ENV_PATH,
    load: [rabbitMqOptions],
    validate: validateEnvironments,
  }),
    PrismaModule, TaskModule, TaskCategoryModule, TaskTagModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
