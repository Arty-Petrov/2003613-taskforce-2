import { ApiProperty, PickType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserRatingDto extends PickType(UserDto,
  ['_id', 'evaluationSum', 'responsesCount']
) {
  @ApiProperty({required: true})
  public  _id;

  @ApiProperty({required: true})
  public evaluationSum;

  @ApiProperty({required: true})
  public responsesCount;
}
