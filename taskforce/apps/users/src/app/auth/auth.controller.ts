import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { fillObject, JwtAccessGuard, JwtRefreshGuard, UserData } from '@taskforce/core';
import { User } from '@taskforce/shared-types';
import { CurrentUser } from '../decorators/current-user.decorator';
import CreateUserDto from '../user/dto/create-user.dto';
import { UserRdo } from '../user/rdo/user.rdo';
import { UserService } from '../user/user.service';
import { AuthApiError } from './auth.constant';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/lockal-auth.guard';
import { LoggedUserRdo } from './rdo/logged-user.rdo';
import TokenDataRdo from './rdo/token-data.rdo';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The new user has been successfully created.'
  })
  @Post('signup')
  async signupUser(@Headers('authorization') token: string, @Body() dto: CreateUserDto) {
    const activeUserSession = await this.authService.checkAuthorizationStatus(token);
    if (!!activeUserSession) {
      throw new UnauthorizedException(AuthApiError.AlreadyAuthorized)
    }

    const newUser = await this.userService.create(dto);

    return fillObject(UserRdo, newUser, [newUser.role]);
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: 'User has been successfully logged.'
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: User) {
    // const verifiedUser = await this.userService.verifyUser(dto);
    const tokenData = fillObject(TokenDataRdo, user);
    return this.authService.generateTokens(tokenData);
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auth token is valid.'
  })
  @Get()
  @UseGuards(JwtAccessGuard)
  private async check(@UserData('id') id: string) {
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
    @UserData('id') userId: string,
    @UserData('refreshToken') refreshToken: string) {
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
  async logoutUser(@UserData('id') userId: string,) {
   await this.authService.deleteRefreshToken(userId);
   return HttpStatus.ACCEPTED
  }
}
