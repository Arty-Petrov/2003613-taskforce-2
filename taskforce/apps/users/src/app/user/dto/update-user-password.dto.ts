import { ApiProperty, PickType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserPasswordDto extends PickType(UserDto,
  ['email', 'password', 'passwordUpdate']
) {
  @ApiProperty({required: true})
  public email;

  @ApiProperty({required: true})
  public password;

  @ApiProperty({required: true})
  public passwordUpdate: string;
}
