export interface Request {
  id?: number;
  executorId: string;
  taskId: number;
  text: string;
  costProposal?: number;
  publishedAt?: Date;
}
