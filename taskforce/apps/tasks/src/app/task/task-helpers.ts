import { TaskAction, TaskStatus } from '@taskforce/shared-types';

export function adaptTaskStatusToAction(newStatus: TaskStatus): TaskAction{
  switch (newStatus) {
    case TaskStatus.Rejected:
      return TaskAction.SetRejected
    case TaskStatus.InProgress:
      return TaskAction.SetInProgress;
    case TaskStatus.Failed:
      return TaskAction.SetFailed;
    case TaskStatus.Done:
      return TaskAction.SetDone
  }
}
