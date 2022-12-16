import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJwtConfig } from '../../config/jwt.config';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
      UserModule,
      PassportModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: getJwtConfig
      })
    ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
