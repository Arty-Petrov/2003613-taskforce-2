import { Comment } from '@taskforce/shared-types';

export default class CommentEntity implements Comment {
  public id: number;
  public authorId: string;
  public taskId: number;
  public text: string;
  public publishAt: Date;

  constructor(comment:Comment) {
    this.fillEntity(comment);
  }

  public toObject() {
    return {...this};
  }

  public fillEntity(comment: Comment) {
  this.id = comment?.id;
  this.authorId = comment.authorId;
  this.taskId = comment.taskId;
  this.text = comment.text;
  this.publishAt = new Date();
  }
}
