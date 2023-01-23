import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenSessionModule } from '../tokens/token-session.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessModule } from './jwt-access.module';
import { JwtRefreshModule } from './jwt-refresh.module';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [
      forwardRef(() => UserModule),
      PassportModule,
      TokenSessionModule,
      JwtAccessModule,
      JwtRefreshModule,
    ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
