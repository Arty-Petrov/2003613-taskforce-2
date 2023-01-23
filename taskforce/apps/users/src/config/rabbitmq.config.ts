import { ConfigService, registerAs } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

export const rabbitMqOptions = registerAs('rmq', () => ({
  user: process.env.RABBIT_USER,
  password: process.env.RABBIT_PASSWORD,
  host: process.env.RABBIT_HOST,
  authQueue: process.env.RABBIT_AUTH_SERVICE_QUEUE,
  notifyQueue: process.env.RABBIT_NOTIFY_SERVICE_QUEUE,
}));

export function getAuthRMqConfig(configService: ConfigService): RmqOptions {
  const user = configService.get<string>('rmq.user');
  const password = configService.get<string>('rmq.password');
  const host = configService.get<string>('rmq.host');
  const queue = configService.get<string>('rmq.authQueue');
  const url = `amqp://${user}:${password}@${host}`;
  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: queue,
      replyQueue:'',
      persistent: true,
      noAck: true,
      queueOptions: {
        durable: true,
      }
    }
  }
}

export function getNotifyRMqConfig(configService: ConfigService): RmqOptions {
  const user = configService.get<string>('rmq.user');
  const password = configService.get<string>('rmq.password');
  const host = configService.get<string>('rmq.host');
  const queue = configService.get<string>('rmq.notifyQueue');
  const url = `amqp://${user}:${password}@${host}`;
  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: queue,
      replyQueue:'',
      persistent: true,
      noAck: true,
      queueOptions: {
        durable: true,
      }
    }
  }
}

export const getRabbitMqConfig = {
  Auth: getAuthRMqConfig,
  Notify: getNotifyRMqConfig,
}
