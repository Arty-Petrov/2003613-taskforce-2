import { ApiProperty } from '@nestjs/swagger';
import { InputExample } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';

export default class TaskRequestDto {
  @ApiProperty({
    description: 'Task id',
    example: InputExample.PostgreId
  })
  @Transform(({value}) => +value)
  public taskId: number;

  @ApiProperty({
    description: 'Requester id',
    example: InputExample.MongoId
  })
  public executorId: string;
}
