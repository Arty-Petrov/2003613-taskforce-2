export const TASKS_SERVICE_ENV_PATH = 'apps/tasks/src/environments/.tasks.env';
export const TASKS_RABBITMQ_SERVICE = Symbol('TASKS_RABBITMQ_SERVICE');

export enum EnvValidationMessage {
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQTasksQueue = 'RabbitMQ Tasks Queue is required',
  RMQAuthQueue = 'RabbitMQ Auth Queue is required',
}
