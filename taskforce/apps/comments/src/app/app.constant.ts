export const COMMENT_SERVICE_ENV_PATH = 'apps/comments/src/environments/.comments.env';

export enum EnvValidationMessage {
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQAuthQueueRequired = 'RabbitMQ Auth Queue is required',
  RMQCommentsQueueRequired = 'RabbitMQ Comments Queue is required',
  RMQTasksQueueRequired = 'RabbitMQ Tasks Queue is required',
}
