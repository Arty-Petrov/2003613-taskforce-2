import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { API_GATEWAY_SERVICE_ENV_PATH } from './app.constant';
import { CommentsModule } from './commets/comments.module';
import { validateEnvironments } from './env.valitation';
import { NotifyModule } from './notify/notify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: API_GATEWAY_SERVICE_ENV_PATH,
      load: [rabbitMqOptions],
      validate: validateEnvironments,
    }),
    NotifyModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
