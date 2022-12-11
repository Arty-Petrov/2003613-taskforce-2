import { Entity, TaskTag } from '@task-force/shared-types';

export class TaskTagEntity implements Entity<TaskTagEntity>, TaskTag {
  public id: number;
  public title: string;

  constructor(tag: TaskTag) {
    this.fillEntity(tag);
  }

  public toObject() {
    return {...this};
  }

  public fillEntity(entity: TaskTag) {
    this.id = entity.id;
    this.title = entity.title;
  }
}
