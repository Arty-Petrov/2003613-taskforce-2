export const REQUEST_SERVICE_ENV_PATH = 'apps/requests/src/environments/.requests.env';

export enum EnvValidationMessage {
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQAuthQueueRequired = 'RabbitMQ Auth Queue is required',
  RMQTasksQueueRequired = 'RabbitMQ Tasks Queue is required',
}
