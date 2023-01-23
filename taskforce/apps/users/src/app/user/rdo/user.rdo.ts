import { ApiProperty } from '@nestjs/swagger';
import { City, InputExample, FileElement, UserRole } from '@taskforce/shared-types';
import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';
import { ResponseGroup, UserApiDescription } from '../user.constant';

export class UserRdo {
  @ApiProperty({
    description: UserApiDescription.Id,
    example: InputExample.MongoId,
  })
  @Transform(({ obj }) => obj._id.toString())
  @Expose({ name: '_id' })
  public id: string;

  @ApiProperty({
    description: UserApiDescription.Email,
    example: InputExample.Email,
  })
  @Expose()
  public email: string;

  @ApiProperty({
    description: UserApiDescription.Name,
    example: InputExample.Name,
  })
  @Expose()
  public name: string;

  @ApiProperty({
    description: UserApiDescription.City,
    example: InputExample.City,
  })
  @Expose()
  public city: City;

  @ApiProperty({
    description: UserApiDescription.DateBirth,
    example: InputExample.Date,
  })
  @Expose({name: 'dateBirth'})
  @Transform(({ value }) => {
    return dayjs().diff(value, 'years')
  })
  public age: string;

  @ApiProperty({
    description: UserApiDescription.Role,
    example: InputExample.Role,
  })
  @Expose()
  public role: UserRole;

  @ApiProperty({
    description: UserApiDescription.Image,
    example: InputExample.PictureFile,

  })
  @Expose({
    groups: [ResponseGroup.Avatar, UserRole.Client, UserRole.Executor]
  })
  public avatar: FileElement;

  @ApiProperty({
    description: UserApiDescription.Info,
    example: InputExample.Text,
  })
  @Expose()
  public info: string;

  @ApiProperty({
    description: UserApiDescription.TasksPublished,
    example: InputExample.Number,
  })
  @Expose({groups: [UserRole.Client]})
  public taskPublishedCount?: number;

  @ApiProperty({
    description: UserApiDescription.TasksNew,
    example: InputExample.Number,
  })
  @Expose({groups: [UserRole.Client]})
  taskNewCount?: number;

  @ApiProperty({
    description: UserApiDescription.Occupation,
    example: InputExample.Occupations,
  })
  @Expose( {groups: [UserRole.Executor]})
  public occupations?: string[];

  @ApiProperty({
    description: UserApiDescription.Rating,
    example: InputExample.Rating,
  })
  @Expose({groups: [UserRole.Executor]})
  public rating?: number;

  @ApiProperty({
    description: UserApiDescription.Rank,
    example: InputExample.Number,
  })
  @Expose({groups: [UserRole.Executor]})
  public rank?: number;

  @ApiProperty({
    description: UserApiDescription.TaskDone,
    example: InputExample.Number,
  })
  @Expose({groups: [UserRole.Executor]})
  public taskDoneCount?: number;

  @ApiProperty({
    description: UserApiDescription.TaskFailed,
    example: InputExample.Number,
  })
  @Expose({groups: [UserRole.Executor]})
  public taskFailedCount?: number;
}
