import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUserData, createPattern, fillObject } from '@taskforce/core';
import { CommandUser, User } from '@taskforce/shared-types';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/lockal-auth.guard';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoggedUserRdo } from './rdo/logged-user.rdo';
import TokenDataRdo from './rdo/token-data.rdo';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: 'User has been successfully logged.'
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: User) {
    const tokenData = fillObject(TokenDataRdo, user);
    return this.authService.generateTokens(tokenData);
  }
  @ApiBody({
    description: 'Validate Auth token'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auth token is valid.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Auth token is invalid.'
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(JwtAccessGuard)
  private async check(@AuthUserData('id') id: string) {
    const user = await this.userService.getById(id);
    if (!user) {
      return HttpStatus.UNAUTHORIZED;
    }
    return HttpStatus.ACCEPTED;
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The tokens are refreshed.'
  })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @AuthUserData('id') userId: string,
    @AuthUserData('refreshToken') refreshToken: string) {
    const existUser = await this.userService.getById(userId);
    const tokenData = fillObject(TokenDataRdo, existUser);
    return this.authService.refreshTokens(tokenData, refreshToken);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user is logout.'
  })
  @Post('logout')
  @UseGuards(JwtAccessGuard)
  async logoutUser(@AuthUserData('id') userId: string,) {
   await this.authService.deleteRefreshToken(userId);
   return HttpStatus.ACCEPTED
  }


  @MessagePattern(createPattern(CommandUser.ValidateUser))
  public async validateUser(
    @Payload('Authentication') token: string
  ){
    return this.authService.getAccessTokenData(token);
  }
}
