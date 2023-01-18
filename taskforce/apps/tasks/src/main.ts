/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';
import { AppModule } from './app/app.module';
import { getRabbitMqConfig } from './config/rabbitmq.config';

async function bootstrap() {
  const tasksApp = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('The «Tasks» service')
    .setDescription('Tasks service API')
    .setVersion('1.0')
    .build();

  const globalPrefix = 'api';
  tasksApp.setGlobalPrefix(globalPrefix);

  const document = SwaggerModule.createDocument(tasksApp, config);
  SwaggerModule.setup('spec', tasksApp, document);

  const configService = tasksApp.get<ConfigService>(ConfigService);
  tasksApp.connectMicroservice(getRabbitMqConfig.Tasks(configService));

  await tasksApp.startAllMicroservices();

  tasksApp.useGlobalPipes(new ValidationPipe({
    transform: true,
    skipUndefinedProperties: true
  }));

  const port = process.env.PORT || 3334;
  await tasksApp.listen(port);
  Logger.log(
    `🚀 Tasks application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
