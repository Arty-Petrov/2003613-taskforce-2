import { Request } from '@taskforce/shared-types';

export default class RequestEntity implements Request {
  public id: number;
  public executorId: string;
  public taskId: number;
  public text: string;
  public costProposal: number;
  public publishedAt: Date;

  constructor(request: Request) {
    this.fillEntity(request);
  }

  public toObject() {
    return {...this};
  }

  public fillEntity(request: Request) {
    this.id = request.id;
    this.executorId = request.executorId;
    this.taskId = request.taskId;
    this.text = request.text;
    this.costProposal = request.costProposal;
    this.publishedAt = request.publishedAt;
  }
}
