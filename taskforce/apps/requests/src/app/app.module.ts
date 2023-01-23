import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { REQUEST_SERVICE_ENV_PATH } from './app.constant';
import { validateEnvironments } from './env.valitation';
import { PrismaModule } from './prisma/prisma.module';
import { RequestModule } from './request/request.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    cache: true,
    isGlobal: true,
    envFilePath: REQUEST_SERVICE_ENV_PATH,
    load: [rabbitMqOptions],
    validate: validateEnvironments,
  }),
  PrismaModule, PrismaModule, RequestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
