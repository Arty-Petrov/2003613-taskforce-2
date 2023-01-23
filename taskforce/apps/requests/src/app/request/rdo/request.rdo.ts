import { PickType } from '@nestjs/swagger';
import { UserInfo } from '@taskforce/shared-types';
import { Expose } from 'class-transformer';
import RequestDto from '../dto/request.dto';

export default class RequestRdo extends PickType(RequestDto,
  ['id', 'taskId', 'publishedAt', 'text', 'costProposal']
) {
  @Expose()
  public id;

  @Expose()
  public executor: UserInfo;

  @Expose()
  public taskId;

  @Expose()
  public publishedAt;

  @Expose()
  public text;

  @Expose()
  public costProposal;
}
