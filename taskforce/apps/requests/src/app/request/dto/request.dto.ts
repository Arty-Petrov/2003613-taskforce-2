import { ApiProperty } from '@nestjs/swagger';
import { InputExample } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNumber, IsPositive, Length } from 'class-validator';
import { RequestsApiDescription, RequestsApiError, TextLength } from '../requests.constant';


export default class RequestDto {
  @ApiProperty({
    description: RequestsApiDescription.Id,
    example: InputExample.PostgreId
  })
  public id: number;

  @ApiProperty({
    description: RequestsApiDescription.ExecutorId,
    example: InputExample.MongoId,
  })
  @IsMongoId()
  public executorId: string;

  @ApiProperty({
    description: RequestsApiDescription.TaskId,
    example: InputExample.PostgreId,
  })
  @Transform(({value}) => +value)
  @IsNumber()
  @IsPositive()
  public taskId: number;

  @ApiProperty({
    description: RequestsApiDescription.Text,
    example: InputExample.Text,
    required: true,
  })
  @Length(
    TextLength.Min,
    TextLength.Max,
    {
      message: RequestsApiError.TextNotValid,
    })
  public text: string;

  @ApiProperty({
    description: RequestsApiDescription.CostProposal,
    example: InputExample.Number
  })
  @Transform(({value}) => +value)
  @IsNumber()
  public costProposal?: number;

  @ApiProperty({
    description: RequestsApiDescription.PublishAt,
    example: InputExample.DateIso,
  })
  public publishedAt?: Date;
}
