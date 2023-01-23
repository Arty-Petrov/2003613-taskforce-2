import {ConfigService, registerAs} from '@nestjs/config';
import {JwtModuleOptions} from '@nestjs/jwt';
import * as process from 'process';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
}));

export async function getJwtAccessOptions(configService: ConfigService): Promise<JwtModuleOptions> {
  return {
    secret: configService.get<string>('jwt.accessSecret'),
    signOptions: { expiresIn: '6000s', algorithm: 'HS256' }
  }
}

export async function getJwtRefreshOptions(configService: ConfigService): Promise<JwtModuleOptions> {
  return {
    secret: configService.get<string>('jwt.refreshSecret'),
    signOptions: { expiresIn: '1d', algorithm: 'HS256' }
  }
}
