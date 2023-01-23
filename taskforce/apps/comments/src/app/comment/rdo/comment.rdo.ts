import { PickType } from '@nestjs/swagger';
import { UserInfo } from '@taskforce/shared-types';
import { Expose } from 'class-transformer';
import CommentDto from '../dto/comment.dto';


export default class CommentRdo extends PickType(CommentDto,
  ['id', 'taskId', 'publishedAt', 'text']
) {
  @Expose()
  public id;

  @Expose()
  public author: UserInfo;

  @Expose()
  public taskId;

  @Expose()
  public publishedAt;

  @Expose()
  public text;
}
