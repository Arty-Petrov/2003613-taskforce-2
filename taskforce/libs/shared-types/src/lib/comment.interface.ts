export interface Comment {
  id?: number;
  authorId?: string;
  taskId: number;
  text: string;
  publishAt?: Date;
}
