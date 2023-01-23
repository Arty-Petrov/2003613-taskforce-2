/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import * as process from 'process';
import { getRabbitMqConfig } from './config/rabbitmq.config';

async function bootstrap() {
  const commentsApp = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('The «Comments» service')
    .setDescription('Comments service API')
    .setVersion('1.0')
    .build();

  const globalPrefix = 'api';
  commentsApp.setGlobalPrefix(globalPrefix);

  const document = SwaggerModule.createDocument(commentsApp, config);
  SwaggerModule.setup('spec', commentsApp, document);

  const configService = commentsApp.get<ConfigService>(ConfigService);
  commentsApp.connectMicroservice(getRabbitMqConfig.Comments(configService));

  await commentsApp.startAllMicroservices();

  commentsApp.useGlobalPipes(new ValidationPipe({
    skipUndefinedProperties: true
  }));

  const port = process.env.PORT || 3335;
  await commentsApp.listen(port);
  Logger.log(
    `🚀 Comments Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
