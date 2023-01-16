import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { RmqService } from '@taskforce/shared-types';
import { getRabbitMqConfig } from '../../config/rabbitmq.config';
import { TokenSessionModule } from '../tokens/token-session.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessModule } from './jwt-access.module';
import { JwtRefreshModule } from './jwt-refresh.module';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [
      ClientsModule.registerAsync([
        {
          name: RmqService.Auth,
          useFactory: getRabbitMqConfig,
          inject: [ConfigService]
        }
      ]),
      UserModule,
      PassportModule,
      TokenSessionModule,
      JwtAccessModule,
      JwtRefreshModule,
    ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [],
})
export class AuthModule {}
