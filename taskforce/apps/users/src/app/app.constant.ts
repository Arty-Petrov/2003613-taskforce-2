export const USER_SERVICE_ENV_PATH = 'apps/users/src/environments/.users.env';

export const enum EnvValidationMessage {
  DBHostRequired = 'MongoDB host is required',
  DBNameRequired = 'Database name is required',
  DBPortRequired = 'MongoDB port is required',
  DBUserRequired = 'MongoDB user is required',
  DBPasswordRequired = 'MongoDB password is required',
  DBBaseAuthRequired = 'MongoDB authentication base is required',
  RMQHostRequired = 'RabbitMQ host is required',
  RMQUserRequired = 'RabbitMQ user is required',
  RMQPasswordRequired = 'RabbitMQ password is required',
  RMQAuthQueue = 'RabbitMQ Auth Queue is required',
  RMQNotifyQueue = 'RabbitMQ Notify Queue is required',
  MulterDestinationFolder = 'Multer destination folder is required',
}
