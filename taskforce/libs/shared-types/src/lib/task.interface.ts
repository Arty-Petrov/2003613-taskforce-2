import { City } from './city.enum';
import { FileElement } from './file-element';
import { TaskStatus } from './task-status.enum';
import { TaskTag } from './task-tag.interface';

export interface Task {
  id?: number,
  title: string;
  description: string;
  clientId: string;
  categoryId: number;
  status: TaskStatus;
  city: City;
  address?: string;
  dueDate?: Date;
  publishAt?: Date;
  budget?: number;
  tags?: TaskTag[];
  taskPicture?: FileElement;
  executorId?: string;
  applicantsCount?: number;
  applicantsIds?: string[],
  commentsCount?: number;
  isReviewed?: boolean;
  isSent?: boolean;
}
