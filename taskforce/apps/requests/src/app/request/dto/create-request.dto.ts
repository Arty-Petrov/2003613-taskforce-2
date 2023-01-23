import { ApiProperty, PickType } from '@nestjs/swagger';
import RequestDto from './request.dto';

export default class CreateRequestDto extends PickType(RequestDto,
  ['executorId', 'taskId', 'text', 'costProposal']
) {
  @ApiProperty({
    required: false,
  })
  public executorId;

  @ApiProperty({
    required: true,
  })
  public taskId;

  @ApiProperty({
    required: true,
  })
  public text;

  @ApiProperty({
    required: false,
  })
  public costProposal;
}
