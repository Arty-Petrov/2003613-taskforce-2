import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile, UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUserData, createMulterOptions, createPattern, fillObject, Roles } from '@taskforce/core';
import { CommandUser } from '@taskforce/shared-types';
import { HttpExceptionFilter } from '../../../../../libs/core/src/lib/http.exception-filter';
import { AuthApiError } from '../auth/auth.constant';
import { AuthService } from '../auth/auth.service';
import { LoggedUserRdo } from '../auth/rdo/logged-user.rdo';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { MongoidValidationPipe } from '../pipes/mongoid-validation.pipe';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserAvatarDto from './dto/update-user-avatar.dto';
import UpdateUserPasswordDto from './dto/update-user-password.dto';
import UpdateUserRatingDto from './dto/update-user-rating.dto';
import UpdateUserDto from './dto/update-user.dto';
import { UserRdo } from './rdo/user.rdo';
import { CounterUpdateType, MAX_FILE_SIZE, ResponseGroup, UserCounter } from './user.constant';
import { UserService } from './user.service';

const multerOptions = createMulterOptions(MAX_FILE_SIZE);

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({
    type: CreateUserDto,
    description: 'Create user\'s record'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The new user has been successfully created.'
  })
  @Post('signup')
  public async signupUser(
    @Headers('authorization') token: string,
    @Body() dto: CreateUserDto
  ) {
    const activeUserSession = await this.authService.checkAuthorizationStatus(token);
    if (!!activeUserSession) {
      throw new UnauthorizedException(AuthApiError.AlreadyAuthorized)
    }
    const newUser = await this.userService.create(dto);
    return fillObject(UserRdo, newUser, [newUser.role]);
  }

  @ApiResponse({
    type: UserRdo,
    status: HttpStatus.OK,
    description: 'User is found'
  })
  @Get(':id')
  @Roles('client')
  @UseGuards(JwtAccessGuard)
  public async show(
    @Param('id', MongoidValidationPipe) id: string,) {
    const existUser = await this.userService.getById(id);

    return fillObject(UserRdo, existUser, [existUser.role]);
  }

  @ApiBody({
    type: UpdateUserDto,
    description: 'Update user data'
  })
  @ApiResponse({
    type: UserRdo,
    status: HttpStatus.OK,
    description: 'User data has been successfully updated'
  })
  @Patch()
  @UseGuards(JwtAccessGuard)
  public async updateUserData(
    @AuthUserData('id') id: string,
    @Body() dto: UpdateUserDto
  ) {
    const updatedUser = await this.userService.update(id, dto);
    return fillObject(UserRdo, updatedUser, [updatedUser.role]);
  }

  @ApiBody({
    type: UpdateUserPasswordDto,
    description: 'Update user password'
  })
  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: 'User password has been successfully updated'
  })
  @Patch('password')
  @UseGuards(JwtAccessGuard)
  public async updateUserPassword(
    @AuthUserData('id') id: string,
    @Body() dto: UpdateUserPasswordDto
  ) {
    const updatedUser = await this.userService.updatePassword(id, dto);
    return fillObject(UserRdo, updatedUser, [ResponseGroup.Logged]);
  }

  @ApiBody({
    type: UpdateUserPasswordDto,
    description: 'Upload user avatar'
  })
  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: 'User avatar has been successfully uploaded'
  })
  @Post('avatar')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  public async uploadUserAvatar(
    @AuthUserData('id') id: string,
    @UploadedFile() file: any
  ) {
    const dto: UpdateUserAvatarDto = {
      avatar: {
        url: file.path,
        name: file.filename,
      },
    };

    const updatedUser = await this.userService.updateAvatar(id, dto);
    return fillObject(UserRdo, updatedUser, [ResponseGroup.Avatar]);
  }

  @MessagePattern(createPattern(CommandUser.GetUsers))
  public async getUsers(
    @Payload('userIds') userIds: string[]
  ) {
    console.log([...userIds]);
    return this.userService.getUsersList(userIds);
  }

  @UseFilters(new HttpExceptionFilter())
  @MessagePattern(createPattern(CommandUser.GetUser))
  public async getUser(
    @Payload('userId') userId: string
  ) {
    console.log(userId);
    return this.userService.getById(userId);
  }

  @EventPattern(createPattern(CommandUser.IncreaseCounterTasksPublished))
  public async increaseCounterTasksPublished(
    @Payload('clientId') clientId: string,
  ){
    return this.userService.updateCounters(
      clientId,
      [
        UserCounter.Published,
        UserCounter.New
      ],
      CounterUpdateType.Increase);
  }

  @EventPattern(createPattern(CommandUser.DecreaseCounterTasksPublished))
  public async decreaseCounterTasksPublished(
    @Payload('clientId') clientId: string,
  ){
    return this.userService.updateCounters(
      clientId,
      [
        UserCounter.Published,
      ],
      CounterUpdateType.Decrease
    );
  }

  @EventPattern(createPattern(CommandUser.DecreaseCounterTasksNew))
  public async decreaseCounterTasksNew(
    @Payload('clientId') clientId: string,
  ){
    console.log('DecreaseCounterTasksNew', clientId);
    return this.userService.updateCounters(
      clientId,
      [
        UserCounter.New,
      ],
      CounterUpdateType.Decrease
    );
  }

  @EventPattern(createPattern(CommandUser.IncreaseCounterTasksDone))
  public async increaseCounterTasksDone(
    @Payload('clientId') clientId: string,
  ){
    return this.userService.updateCounters(
      clientId,
      [
        UserCounter.Done,
      ],
      CounterUpdateType.Increase
    );
  }

  @EventPattern(createPattern(CommandUser.IncreaseCounterTasksFailed))
  public async increaseCounterTasksFailed(
    @Payload('clientId') clientId: string,
  ){
    return this.userService.updateCounters(
      clientId,
      [
        UserCounter.Failed,
      ],
      CounterUpdateType.Increase
    );
  }

  @EventPattern(createPattern(CommandUser.UpdateUserRating))
  public async updateUserRating(
    @Payload() dto: UpdateUserRatingDto,
  ){
    return this.userService.updateUserRating(dto);
  }

}
