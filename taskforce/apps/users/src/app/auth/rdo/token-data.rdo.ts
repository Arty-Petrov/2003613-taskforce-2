import { PickType } from '@nestjs/swagger';
import { UserRdo } from '../../user/rdo/user.rdo';

export default class TokenDataRdo extends PickType(UserRdo,['id', 'email', 'role', 'name', 'avatar']){}
