import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { RESPONSE_SERVICE_ENV_PATH } from './app.constant';
import { validateEnvironments } from './env.valitation';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: RESPONSE_SERVICE_ENV_PATH,
      load: [rabbitMqOptions],
      validate: validateEnvironments,
    }),
    PrismaModule, ResponseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
