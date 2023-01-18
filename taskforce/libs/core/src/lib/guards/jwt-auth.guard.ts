import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CommandMessage, RmqServiceName } from '@taskforce/shared-types';
import { catchError, Observable, tap } from 'rxjs';
import { createPattern } from '../helpers';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(RmqServiceName.Auth) private authRmqClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('auth');
    const authentication = this.getAuthentication(context);
    return this.authRmqClient
      .send(createPattern(CommandMessage.ValidateUser), {
        Authentication: authentication,
      })
      .pipe(
        tap((res) => {
          console.log('Auth', res, context);
          this.addUser(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .get('Authorization').replace('Bearer', '').trim();
    }
    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }
    console.log('Auth', authentication);
    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
