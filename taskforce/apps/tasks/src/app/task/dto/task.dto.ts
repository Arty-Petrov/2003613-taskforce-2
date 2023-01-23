import { ApiProperty } from '@nestjs/swagger';
import { City, FileElement, InputExample, TaskStatus } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsMongoId, IsPositive, MaxLength, MinDate, MinLength } from 'class-validator';
import { AddressTextLength, TaskApiDescription, TaskApiError } from '../task.constant';

export default class TaskDto {
  @ApiProperty({
    description: TaskApiDescription.Title,
    example: InputExample.Text,
  })
  public title: string;

  @ApiProperty({
    description: TaskApiDescription.Description,
    example: InputExample.Text,
  })
  public description: string;

  @ApiProperty({
    description: TaskApiDescription.ExecutorId,
    example: InputExample.MongoId,
  })
  @IsMongoId()
  public clientId?: string;

  @ApiProperty({
    description: TaskApiDescription.CategoryId,
    example: InputExample.PostgreId
  })
  @Transform(({value}) => +value)
  public categoryId: number;

  @ApiProperty({
    description: TaskApiDescription.City,
    example: InputExample.City,
  })
  @IsEnum(City,
    {message: TaskApiError.CityIsInvalid})
  @Transform(({value}) => value as City)
  public city: City;

  @ApiProperty({
    description: TaskApiDescription.Address,
    example: InputExample.Text,
  })
  @MinLength(AddressTextLength.Min)
  @MaxLength(AddressTextLength.Max)
  public address?: string;

  @ApiProperty({
    description: TaskApiDescription.DueDate,
    example: InputExample.Date
  })
  @IsDate()
  @Transform((
    {value}) => new Date(
      new Date(value)
        .setHours(23, 59, 59, 999)
    )
  )
  @MinDate(
    new Date(new Date()
      .setHours(0, 0, 0, 0)),
    {
      message: TaskApiError.DueDate,
    }
  )
  public dueDate?: Date;

  @ApiProperty({
    description: TaskApiDescription.Budget,
    example: InputExample.Number
  })
  @Transform(({value}) => +value)
  @IsPositive()
  public budget?: number;

  @ApiProperty({
    description: TaskApiDescription.Tags,
    example: [InputExample.PostgreId, InputExample.PostgreId],
  })
  @IsArray()
  tags?: number[];

  @ApiProperty({
    description: TaskApiDescription.Status,
    example: InputExample.Status,
  })
  @IsEnum(TaskStatus,
    {message: TaskApiError.StatusIsInvalid})
  @Transform(({value}) => value as TaskStatus)
  public status?: TaskStatus;

  @ApiProperty({
    description: TaskApiDescription.TaskPicture,
    example: InputExample.PictureFile,
  })
  public taskPicture?: FileElement;

  @ApiProperty({
    description: TaskApiDescription.ExecutorId,
    example: InputExample.MongoId,
  })
  @IsMongoId()
  public executorId: string;
}
