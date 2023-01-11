import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from '../config/database.config';
import { jwtConfig } from '../config/jwt.config';
import { getMongoDbConfig } from '../config/mongodb.config';
import { rabbitMqOptions } from '../config/rabbitmq.config';
import { USER_SERVICE_ENV_PATH } from './app.constant';
import { AuthModule } from './auth/auth.module';
import { JwtAccessModule } from './auth/jwt-access.module';
import { JwtRefreshModule } from './auth/jwt-refresh.module';
import { validateEnvironments } from './env.validation';
import { TokenSessionModule } from './tokens/token-session.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: USER_SERVICE_ENV_PATH,
      load: [databaseConfig, jwtConfig, rabbitMqOptions],
      validate: validateEnvironments,
    }),
    MongooseModule.forRootAsync(getMongoDbConfig()),
    AuthModule,
    JwtAccessModule,
    JwtRefreshModule,
    TokenSessionModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
