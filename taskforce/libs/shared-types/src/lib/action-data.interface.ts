import { TaskAction } from './task-action.enum';
import { UserRole } from './user-role.enum';

export interface ActionData {
  action: TaskAction
  userId: string;
  userRole: UserRole;
  taskId: number;
}
