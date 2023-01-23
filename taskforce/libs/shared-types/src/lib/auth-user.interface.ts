import { UserMain } from '@taskforce/shared-types';

export interface AuthUser extends Pick<UserMain, 'email' | 'name' | 'role' | 'avatar'> {
  sub: string;
  avatar?;
}
