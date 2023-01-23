import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandNotify, RmqServiceName, User, UserRole } from '@taskforce/shared-types';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserAvatarDto from './dto/update-user-avatar.dto';
import UpdateUserPasswordDto from './dto/update-user-password.dto';
import UpdateUserRatingDto from './dto/update-user-rating.dto';
import UpdateUserDto from './dto/update-user.dto';
import { CounterUpdateType, UserApiError, UserCounter } from './user.constant';
import { UserEntity } from './user.entity';
import UserRepository from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(RmqServiceName.Notify) private readonly notifyRmqClient: ClientProxy,
  ) {}

  public async create(dto: CreateUserDto): Promise<User | null>  {
    const {
      name, email, role, dateBirth,
      city, password
    } = dto;

    const user = {
      name, email, role, avatar: {}, dateBirth,
      city, passwordHash: '',
    } as User;

    const existUser = await this.userRepository.findByEmail(email);
    if (existUser) {
      throw new ConflictException(`User with email: ${email} already exist`)
    }

    const userEntity =
      await new UserEntity(user).setPassword(password);

    const createdUser = await this.userRepository.create(userEntity);

    this.notifyRmqClient.emit(
      createPattern(CommandNotify.AddSubscriber),
      {
        email: createdUser.email,
        name: createdUser.name,
        userId: createdUser._id.toString(),
        role: createdUser.role,
      }
    );

    return createdUser;
  }

  public async verifyUser (dto: LoginUserDto): Promise<User | null> {
    const {
      email, password
    } = dto;
    const existUser = await this.getByEmail(email);

    const userEntity = new UserEntity(existUser);
    if (! await userEntity.comparePassword(password)) {
      throw new Error(UserApiError.PasswordIsWrong);
    }

    return userEntity;
  }

  public async getById(id: string): Promise<User | null>  {
    const existUser = await this.userRepository.findById(id);
    if (!existUser) {
      throw new HttpException(UserApiError.NotFound, HttpStatus.NOT_FOUND);
    }
    return existUser;
  }

  public async getByEmail(email: string): Promise<User | null>  {
    const existUser = await this.userRepository.findByEmail(email);
    if (!existUser) {
      throw new NotFoundException(UserApiError.NotFound);
    }
    return existUser;
  }

  public async getUsersList(userIds: string[]): Promise<User[]>{
    const users = await this.userRepository.findManyByIdsList(userIds);
    console.log([...users]);
    return users;
  }

  public async update(id: string, dto: UpdateUserDto): Promise<User | null>  {
    const existUser = await this.getById(id);

    if (existUser.role === UserRole.Client && dto?.occupations) {
      throw new ForbiddenException(UserApiError.OccupationNotAllowed);
    }

    const newUserEntity = new UserEntity({...existUser, ...dto});
    return this.userRepository.update(id, newUserEntity);
  }

  public async updatePassword (_id: string, dto: UpdateUserPasswordDto) {
    const {
      email, password, passwordUpdate,
    } = dto;

    const verifiedUser = await this.verifyUser({
      email: email,
      password: password
    });

    const userEntity =
      await new UserEntity(verifiedUser).setPassword(passwordUpdate);

    return this.userRepository.update(verifiedUser._id, userEntity);
  }

  public async updateAvatar (_id: string, dto: UpdateUserAvatarDto) {
    const {
      avatar,
    } = dto;

    const user = await this.getById(_id);

    const userEntity = await new UserEntity({...user, avatar});
    return this.userRepository.update(user._id, userEntity);
  }

  public async updateUserRating(dto: UpdateUserRatingDto){
    const {_id, evaluationSum , responsesCount} = dto;
    const existUser = await this.getById(_id);
    const rating = evaluationSum / (responsesCount + existUser.taskFailedCount)

    const newUserEntity = new UserEntity({...existUser, rating: rating});
    return this.userRepository.update(_id, newUserEntity);
  }

  public async getUserRank(id: string){
    const usersRanked = await this.userRepository.findAllSortedByRating();
    return usersRanked.findIndex((user) => user._id === id) + 1;

  }

  public async updateCounters(clientId: string, fields: UserCounter[], updateType: CounterUpdateType) {
    const user = await this.getById(clientId);
    for (const field of fields){
      user[field] += updateType
    }
    const userEntity = new UserEntity(user);
    await this.userRepository.update(clientId, userEntity);
    return HttpStatus.NO_CONTENT;
  }
}
