import { ApiProperty, PickType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserAvatarDto extends PickType(UserDto,['avatar']) {
  @ApiProperty({required: true})
  public avatar;
}
