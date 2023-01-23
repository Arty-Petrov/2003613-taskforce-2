export const API_GATEWAY_SERVICE_ENV_PATH = 'apps/api-gateway/src/environments/.api-gateway.env';
export const RABBITMQ_SERVICE = Symbol('RABBITMQ_SERVICE');

export enum EnvValidationMessage {
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQAuthQueueRequired = 'RabbitMQ Auth Queue is required',
  RMQCommentsQueueRequired = 'RabbitMQ Comments Queue is required',
  RMQNotifyQueueRequired = 'RabbitMQ Notify Queue is required',
  RMQRequestsQueueRequired = 'RabbitMQ Requests Queue is required',
  RMQResponsesQueueRequired = 'RabbitMQ Responses Queue is required',
  RMQTasksQueueRequired = 'RabbitMQ Tasks Queue is required',
}
