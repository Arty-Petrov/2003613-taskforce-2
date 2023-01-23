import { ApiProperty } from '@nestjs/swagger';
import { InputExample } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNumber, IsPositive, Length } from 'class-validator';
import { CommentApiError, CommentApiDescription, TextLength } from '../comment.constant';



export default class CommentDto {
  @ApiProperty({
    description: CommentApiDescription.Id,
    example: InputExample.PostgreId
  })
  public id: number;

  @ApiProperty({
    description: CommentApiDescription.AuthorId,
    example: InputExample.MongoId,
  })
  @IsMongoId()
  public authorId: string;

  @ApiProperty({
    description: CommentApiDescription.TaskId,
    example: InputExample.PostgreId,
  })
  @Transform(({value}) => +value)
  @IsNumber()
  @IsPositive()
  public taskId: number;

  @ApiProperty({
    description: CommentApiDescription.Text,
    example: InputExample.Text,
    required: true,
  })
  @Length(
    TextLength.Min,
    TextLength.Max,
    {
      message: CommentApiError.TextNotValid,
    })
  public text: string;

  @ApiProperty({
    description: CommentApiDescription.PublishAt,
    example: InputExample.DateIso,
  })
  public publishedAt?: Date;
}
