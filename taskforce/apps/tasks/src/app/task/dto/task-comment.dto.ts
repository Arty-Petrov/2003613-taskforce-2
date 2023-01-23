import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export default class TaskCommentDto {
  @ApiProperty({
    description: 'Task id',
    example: '4353642828136379763'
  })
  @Transform(({value}) => +value)
  public taskId: number;

  @ApiProperty({
    description: 'Comment id',
    example: '4353642828136379763'
  })
  @Transform(({value}) => +value)
  public commentId: number;
}
