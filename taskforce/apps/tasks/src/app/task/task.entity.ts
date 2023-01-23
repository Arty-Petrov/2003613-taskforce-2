import { City, Entity, FileElement, Task, TaskStatus, TaskTag } from '@taskforce/shared-types';

export class TaskEntity implements Entity<TaskEntity>, Task {
  public id: number;
  public title: string;
  public description: string;
  public clientId: string;
  public categoryId: number;
  public status: TaskStatus;
  public city: City;
  public address: string;
  public dueDate: Date;
  public publishAt: Date;
  public budget: number;
  public tags: TaskTag[];
  public taskPicture: FileElement;
  public executorId: string;
  public requestsCount: number;
  public requesterIds?: string[];
  public commentsCount: number;
  public commentIds: number[];
  public isResponsed: boolean;
  public isSent: boolean;

  constructor(task:Task) {
    this.fillEntity(task);
  }

  public toObject(): TaskEntity {
    return {
      ...this,
      tags: this.tags.map(({id}) => ({ id })),
    };
  }

  public fillEntity(entity:  Task): void {
    this.title = entity.title;
    this.description = entity.description;
    this.clientId = entity.clientId;
    this.categoryId = entity.categoryId;
    this.status = entity.status;
    this.city = entity.city;
    this.address = entity.address;
    this.dueDate = entity.dueDate;
    this.publishAt = new Date();
    this.budget = entity?.budget;
    this.tags = entity.tags;
    this.taskPicture = {...entity.taskPicture};
    this.executorId = entity.executorId;
    this.requestsCount = entity.requestsCount;
    this.requesterIds = entity.requesterIds;
    this.commentsCount = entity.commentsCount;
    this.commentIds = entity.commentIds;
    this.isResponsed = entity.isResponsed;
    this.isSent = entity.isSent;
  }
}
