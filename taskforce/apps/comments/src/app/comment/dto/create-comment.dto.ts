import { ApiProperty, PickType } from '@nestjs/swagger';
import CommentDto from './comment.dto';

export default class CreateCommentDto extends PickType(CommentDto,
  ['taskId', 'text']
) {
  public authorId;

  @ApiProperty({
    required: true,
  })
  public taskId;

  @ApiProperty({
    required: true,
  })
  public text;
}
