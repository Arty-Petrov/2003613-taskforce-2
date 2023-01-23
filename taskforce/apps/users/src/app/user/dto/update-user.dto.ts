import { ApiProperty, PickType } from '@nestjs/swagger';
import UserDto from './user.dto';

export default class UpdateUserDto extends PickType(UserDto,
  ['name','city', 'info', 'dateBirth', 'occupations']
) {
  @ApiProperty({required: false})
  public name;

  @ApiProperty({required: false})
  public city;

  @ApiProperty({required: false})
  public info;

  @ApiProperty({required: false})
  public dateBirth;

  @ApiProperty({required: false,})
  public occupations;
}
