import { ApiProperty, PickType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class CreateUserDto extends PickType(UserDto,
  ['email', 'name', 'city', 'password', 'dateBirth','role', 'avatar']
) {
  @ApiProperty({required: true})
  public email;

  @ApiProperty({required: true})
  public name;

  @ApiProperty({required: true})
  public city;

  @ApiProperty({required: true})
  public password;

  @ApiProperty({required: true})
  public dateBirth;

  @ApiProperty({required: true})
  public role;

  @ApiProperty({required: false})
  public avatar;
}
