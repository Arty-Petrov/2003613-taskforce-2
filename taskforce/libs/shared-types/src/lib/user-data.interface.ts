import { UserRole } from '@taskforce/shared-types';

export interface UserData {
  userId?: string,
  executorId?: string,
  userRole?: UserRole,
}
