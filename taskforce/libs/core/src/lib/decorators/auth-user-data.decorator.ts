import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUserData = createParamDecorator(
  (property: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return property ? request.user[property] : {...request.user};
  },
);
