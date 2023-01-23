import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { COMMENT_SERVICE_ENV_PATH } from './app.constant';
import { CommentModule } from './comment/comment.module';
import { validateEnvironments } from './env.valitation';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    cache: true,
    isGlobal: true,
    envFilePath: COMMENT_SERVICE_ENV_PATH,
    load: [rabbitMqOptions],
    validate: validateEnvironments,
  }),
  PrismaModule, PrismaModule, CommentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
