import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { addUserData, createPattern } from '@taskforce/core';
import { AuthUser, CommandTask, CommandUser, RmqServiceName, TaskAction, UserField } from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';
import CreateRequestDto from './dto/create-request.dto';
import RequestEntity from './request.enity';
import RequestRepository from './request.repository';


@Injectable()
export class RequestService {

  constructor(
    @Inject(RmqServiceName.Auth) private authRmqClient: ClientProxy,
    @Inject(RmqServiceName.Tasks) private tasksRmqClient: ClientProxy,
    private readonly requestRepository: RequestRepository
  ) {}

  async create(dto: CreateRequestDto, user: AuthUser) {
    const isValidComment = await lastValueFrom(
      this.tasksRmqClient.send(
        createPattern(CommandTask.ValidateCounterAction),
        {
          action: TaskAction.AddRequest,
          userId: user.sub,
          userRole: user.role,
          taskId: dto.taskId
        })
    );
    console.log('request service action is valid', isValidComment);
    if (!isValidComment) {
      throw new ForbiddenException({message: 'Request isn\'t allowed, check if task status or its existent'})
    }
    const requestEntity = new RequestEntity({...dto, executorId: user.sub});

    const request = await this.requestRepository.create(requestEntity);

    await this.tasksRmqClient.emit(
      createPattern(CommandTask.IncreaseCounterRequests),
      {
        taskId: request.taskId,
        executorId: request.executorId,
      });

    const executor = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUser),
        {
          userId: request.executorId,
        })
    );

    return addUserData(request, executor, UserField.Executor)
  }

  async getRequestsByTaskId(taskId: number) {
    const requests = await this.requestRepository.findByTaskId(taskId);

    const executors = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUsers),
        {
          userIds: requests.map((comment) => comment.executorId)
        })
    );


    return addUserData(requests, executors, UserField.Executor)
  }
}
