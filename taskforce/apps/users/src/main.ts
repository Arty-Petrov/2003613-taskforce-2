import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';
import { AppModule } from './app/app.module';
import { getRabbitMqConfig } from './config/rabbitmq.config';

async function bootstrap() {
  const usersApp = await NestFactory.create(AppModule);


  const config = new DocumentBuilder()
    .setTitle('The «Users» service')
    .setDescription('Users service API')
    .setVersion('1.0')
    .build();

  const globalPrefix = 'api';
  usersApp.setGlobalPrefix(globalPrefix);

  const document = SwaggerModule.createDocument(usersApp, config);
  SwaggerModule.setup('spec', usersApp, document);

  const configService = usersApp.get<ConfigService>(ConfigService);
  usersApp.connectMicroservice(getRabbitMqConfig.Auth(configService));

  await usersApp.startAllMicroservices();

  usersApp.useGlobalPipes(new ValidationPipe({
    skipUndefinedProperties: true
  }));

  const port = process.env.PORT || 3333;
  await usersApp.listen(port);
  Logger.log(
    `🚀 Users application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
