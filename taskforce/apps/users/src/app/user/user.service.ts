import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createEvent } from '@taskforce/core';
import { CommandEvent, User } from '@taskforce/shared-types';
import { RABBITMQ_SERVICE } from '../app.constant';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserPasswordDto from './dto/update-user-password.dto';
import UpdateUserDto from './dto/update-user.dto';
import { UserApiError } from './user.constant';
import { UserEntity } from './user.entity';
import UserRepository from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitClient: ClientProxy,
  ) {}

  async create(dto: CreateUserDto): Promise<User | null>  {
    const {
      name, email, role, dateBirth,
      city, password
    } = dto;

    const user = {
      name, email, role, avatar: {}, dateBirth,
      city, passwordHash: '',
    } as User;

    const existUser =
      await this.userRepository.findByEmail(email);

    if (existUser) {
      throw new ConflictException(UserApiError.Exists);
    }

    const userEntity =
      await new UserEntity(user).setPassword(password);

    const createdUser = await this.userRepository.create(userEntity);

    this.rabbitClient.emit(
      createEvent(CommandEvent.AddSubscriber),
      {
        email: createdUser.email,
        name: createdUser.name,
        userId: createdUser._id.toString(),
        role: createdUser.role,
      }
    );

    return createdUser;
  }

  async verifyUser (dto: LoginUserDto): Promise<User | null> {
    const {
      email, password
    } = dto;
    const existUser = await this.userRepository.findByEmail(email);

    if (!existUser) {
      throw new UnauthorizedException(UserApiError.NotFound);
    }

    const userEntity = new UserEntity(existUser);
    if (! await userEntity.comparePassword(password)) {
      throw new Error(UserApiError.PasswordIsWrong);
    }

    return userEntity;
  }

  async getById(id: string): Promise<User | null>  {
    return this.userRepository.findById(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null>  {
    const existUser = await this.userRepository.findById(id);

    if (!existUser) {
      throw new UnauthorizedException(UserApiError.NotFound);
    }
    const newUserEntity = new UserEntity({...existUser, ...dto});
    return this.userRepository.update(id, newUserEntity);
  }

  async updatePassword (_id: string, dto: UpdateUserPasswordDto) {
    const {
      email, currentPassword, newPassword,
    } = dto;

    const verifiedUser = await this.verifyUser({
      email: email,
      password: currentPassword
    });

    const userEntity =
      await new UserEntity(verifiedUser).setPassword(newPassword);

    return this.userRepository.update(verifiedUser._id, userEntity);
  }
}
