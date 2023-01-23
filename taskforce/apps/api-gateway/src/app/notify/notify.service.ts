import { BadGatewayException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandNotify, CommandTask, RmqServiceName, UserRole } from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotifyService {
  constructor(
    @Inject(RmqServiceName.Auth) private readonly authRmqClient: ClientProxy,
    @Inject(RmqServiceName.Notify) private readonly notifyRmqClient: ClientProxy,
    @Inject(RmqServiceName.Tasks) private readonly tasksRmqClient: ClientProxy,
  ) {}
  public async notifyNewTasks () {
    const tasks = await lastValueFrom(
      this.tasksRmqClient.send(
      createPattern(CommandTask.GetUnsentTasks),
      {},));
    if (!tasks) {
      return HttpStatus.NOT_FOUND;
    }
    const executors = await lastValueFrom(
      this.notifyRmqClient.send(
      createPattern(CommandNotify.GetSubscribers),
      {role: UserRole.Executor},
    ));

    const isSent = await lastValueFrom(this.notifyRmqClient.send(
      createPattern(CommandNotify.SendNewTasks),
      {subscribers: executors, tasks: tasks},
    ));

    if (!isSent) {
      throw new BadGatewayException('Notification can;t be sent')
    }

    const taskIds = tasks.map(task => task.id);

    await this.tasksRmqClient.emit(
      createPattern(CommandTask.MarkTasksAsSent),
      {taskIds: taskIds},
    );

    return HttpStatus.NO_CONTENT;
  }
}
