import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { fillObject } from '@taskforce/core';
import { JwtPayload } from '@taskforce/shared-types';
import { RABBITMQ_SERVICE } from '../app.constant';
import { TokenSessionEntity } from '../tokens/token-session.entity';
import TokenSessionRepository from '../tokens/token-session.repository';
import { AuthApiError } from './auth.constant';
import { TokenDataDto } from './dto/token-data.dto';
import { SessionTokenRdo } from './rdo/sesion-token.rdo';

@Injectable()
export class AuthService {
  constructor(
    @Inject('JwtAccessService') private readonly jwtAccessService: JwtService,
    @Inject('JwtRefreshService') private readonly jwtRefreshService: JwtService,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitClient: ClientProxy,
    private readonly tokenSessionRepository: TokenSessionRepository,
  ) {}

  private createPayload(dto: TokenDataDto): JwtPayload {
    const { id, email, role } = dto;
    return {
      sub: id,
      email: email,
      role: role,
    };
  }

  async generateTokens(dto: TokenDataDto) {
    const userId = dto.id;
    const payload = this.createPayload(dto);
    const accessToken = await this.jwtAccessService.signAsync(payload);
    const refreshToken = await this.jwtRefreshService.signAsync(payload);

    const expDateMilliseconds = await this
      .jwtRefreshService
      .decode(refreshToken)['exp'] * 1000;

    const refreshTokenData = {
      userId: userId,
      expires: new Date(expDateMilliseconds),
    }

    const refreshTokenEntity = new TokenSessionEntity(refreshTokenData);
    await refreshTokenEntity.setToken(refreshToken);

    const existToken = await this.tokenSessionRepository.findByUserId(userId);
    if (existToken) {
      const tokenId = fillObject(SessionTokenRdo, existToken)['id'];
      await this.tokenSessionRepository.update(tokenId, refreshTokenEntity)
    } else {
      await this.tokenSessionRepository.create(refreshTokenEntity);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(dto: TokenDataDto, refreshToken:string) {
    const userId = dto.id;
    const existToken = await this.tokenSessionRepository.findByUserId(userId);
    if (!existToken){
      throw new UnauthorizedException(AuthApiError.RefreshTokenNotFound);
    }
    await this.tokenSessionRepository.destroy(userId);

    const refreshTokenEntity = new TokenSessionEntity(existToken);
    const validateToken = await refreshTokenEntity.compareToken(refreshToken);
    if (!validateToken){
      throw new UnauthorizedException(AuthApiError.RefreshTokenIsWrong);
    }
    return await this.generateTokens(dto);
  }
  async deleteRefreshToken(userId: string): Promise<void>{
    return this.tokenSessionRepository.destroy(userId);
  }
  async getAccessTokenData(token: string)  {
    return this.jwtAccessService.decode(token);
  }

  async checkAuthorizationStatus(token: string): Promise<boolean> {
    if (!token){
      return false;
    }
    const authToken = token.replace('Bearer', '').trim();
    const tokenData = await this.getAccessTokenData(authToken);
    if (!tokenData) {
      return false;
    }
    const { sub } = tokenData;
    const activeUserSession = await this.tokenSessionRepository.findByUserId(sub);

    return !!activeUserSession;
  }
}
