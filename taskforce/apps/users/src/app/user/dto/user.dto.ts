import { ApiProperty } from '@nestjs/swagger';
import { City, FileElement, InputExample, UserRole } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  Length,
  MaxDate,
  MaxLength,
} from 'class-validator';
import * as dayjs from 'dayjs';
import {
  UserApiDescription,
  UserApiError,
  UserInfoLength,
  UserNameLength,
  UserOccupationCount,
  UserPasswordLength,
} from '../user.constant';

export default class UserDto {
  @ApiProperty({
    description: UserApiDescription.Id,
    example: InputExample.MongoId
  })
  @IsMongoId()
  public  _id: string;

  @ApiProperty({
    description: UserApiDescription.Email,
    example: InputExample.Email,
  })
  @IsEmail(
    {},
    {message: UserApiError.EmailNotValid},
  )
  public email: string;

  @ApiProperty({
    description: UserApiDescription.Name,
    example: InputExample.Name,
  })
  @Length(
    UserNameLength.Min,
    UserNameLength.Max,
    {
      message: UserApiError.NameNotValid
    })
  public name: string;

  @ApiProperty({
    description: UserApiDescription.City,
    example: InputExample.City,
  })
  @IsEnum(
    City,
    {
      message: UserApiError.CityIsWrong,
    })
  @Transform(({value}) => value as City)
  public city: City;

  @ApiProperty({
    description: UserApiDescription.Password,
    example: InputExample.Password,
  })
  @Length(
    UserPasswordLength.Min,
    UserPasswordLength.Max,
    {
      message: UserApiError.PasswordNotValid
    })
  public password: string;

  @ApiProperty({
    description: UserApiDescription.PasswordUpdate,
    example: InputExample.PasswordUpdate
  })
  public passwordUpdate: string;

  @ApiProperty({
    description: UserApiDescription.DateBirth,
    example: InputExample.Date,
  })
  @IsDate({
    message: UserApiError.DateBirthNotValid,
  })
  @MaxDate(
    new Date(dayjs().subtract(18, 'year').format('YYYY-MM-DD')),
    {
      message: UserApiError.AgeNotValid
    })
  @Transform(({value}) => new Date(value))
  public dateBirth: Date;

  @ApiProperty({
    description: UserApiDescription.Role,
    example: InputExample.Role,
  })
  @IsEnum(
    UserRole,
    {
      message: UserApiError.RoleIsWrong
    })
  @Transform(({value}) => value as UserRole)
  public role: UserRole;

  @ApiProperty({
    description: UserApiDescription.Image,
    example: InputExample.PictureFile
  })
  public avatar: FileElement;

  @ApiProperty({
    description: UserApiDescription.Info,
    example: InputExample.Text,
  })
  @MaxLength(
    UserInfoLength.Max,
    {
      message: UserApiError.InfoNotValid
    })
  public info?: string;

  @ApiProperty({
    description: UserApiDescription.Occupation,
    example: InputExample.Occupations,
  })
  @IsArray()
  @ArrayMaxSize(
    UserOccupationCount.Max,
    {
      message: UserApiError.OccupationNotValid
    })
  @Transform(({value}) => Array
    .from(new Set(value.map(item => item.toLowerCase())))
    .filter((value: string) => value.length > 0)
  )
  public occupations: string[];

  @ApiProperty({
    description: UserApiDescription.EvaluationSum,
  })
  @IsNumber()
  public evaluationSum: number;

  @ApiProperty({
    description: UserApiDescription.ResponsesCount,
  })
  @IsNumber()
  public responsesCount: number;
}
