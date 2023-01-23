import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { EnvValidationMessage } from './app.constant';

class EnvironmentsConfig {

  @IsString({
    message: EnvValidationMessage.RMQUserRequired
  })
  public RABBIT_USER: string;

  @IsString({
    message: EnvValidationMessage.RMQPasswordRequired
  })
  public RABBIT_PASSWORD: string;

  @IsString({
    message: EnvValidationMessage.RMQHostRequired
  })
  public RABBIT_HOST: string;C

  @IsString({
    message: EnvValidationMessage.RMQAuthQueueRequired
  })
  public RABBIT_AUTH_SERVICE_QUEUE: string;

  @IsString({
    message: EnvValidationMessage.RMQCommentsQueueRequired
  })
  public RABBIT_COMMENTS_SERVICE_QUEUE: string;

  @IsString({
    message: EnvValidationMessage.RMQTasksQueueRequired
  })
  public RABBIT_TASKS_SERVICE_QUEUE: string;
}

export function validateEnvironments(config: Record<string, unknown>) {
  const environmentsConfig = plainToInstance(
    EnvironmentsConfig,
    config,
    { enableImplicitConversion: true  },
  );

  const errors = validateSync(
    environmentsConfig, {
      skipMissingProperties: false
    }
  );

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return environmentsConfig;
}
