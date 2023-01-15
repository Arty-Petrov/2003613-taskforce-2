export const API_GATEWAY_SERVICE_ENV_PATH = 'apps/api-gateway/src/environments/.api-gateway.env';
export const RABBITMQ_SERVICE = Symbol('RABBITMQ_SERVICE');

export enum EnvValidationMessage {
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQSubscriberQueue = 'RabbitMQ Subscribers Queue is required',
  RMQTasksQueue = 'RabbitMQ Tasks Queue is required',
}
