import { BadGatewayException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandMessage, RmqService, UserRole } from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotifyService {
  constructor(
    @Inject(RmqService.Notify) private readonly notifyRmqClient: ClientProxy,
    @Inject(RmqService.Tasks) private readonly tasksRmqClient: ClientProxy,
  ) {}
  public async notifyNewTasks () {
    const tasks = await lastValueFrom(
      this.tasksRmqClient.send(
      createPattern(CommandMessage.GetNewTasks),
      {},));
    if (!tasks) {
      return HttpStatus.NOT_FOUND;
    }
    const executors = await lastValueFrom(
      this.notifyRmqClient.send(
      createPattern(CommandMessage.GetSubscribers),
      {role: UserRole.Executor},
    ));

    const isSent = await lastValueFrom(this.notifyRmqClient.send(
      createPattern(CommandMessage.SendNewTasks),
      {subscribers: executors, tasks: tasks},
    ));

    if (!isSent) {
      throw new BadGatewayException('Notification can;t be sent')
    }

    const taskIds = tasks.map(task => task.id);

    await this.tasksRmqClient.emit(
      createPattern(CommandMessage.MarkTasksAsSent),
      {taskIds: taskIds},
    );

    return HttpStatus.NO_CONTENT;
  }
}
