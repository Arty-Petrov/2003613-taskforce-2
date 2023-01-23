import { PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import UserDto from '../../user/dto/user.dto';

export class TokenDataDto extends PickType(UserDto,[
  'email', 'role', 'name', 'avatar']){
  @IsString()
  public id: string
}
