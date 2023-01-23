import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createPattern } from '@taskforce/core';
import { CommandTask, CommandUser, RmqServiceName } from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';
import CreateResponseDto from './dto/create-response.dto';
import ResponseEntity from './response.entity';
import ResponseRepository from './response.repository';

@Injectable()
export class ResponseService {

  constructor(
    @Inject(RmqServiceName.Tasks) private tasksRmqClient: ClientProxy,
    @Inject(RmqServiceName.Auth) private authRmqClient: ClientProxy,
    private readonly responseRepository: ResponseRepository
  ) {}

  async create(dto: CreateResponseDto) {
    const { taskId, executorId } = dto;

    const existResponse = await this.responseRepository.findByTaskId(taskId);
    if (existResponse) {
      throw new ConflictException();
    }
    const isAllowed = await lastValueFrom(this.tasksRmqClient.send(
      createPattern(CommandTask.ValidateResponse), {
        taskId: taskId,
        clientId: dto.clientId,
        executorId: dto.executorId,
      })
    );
    if (!isAllowed){
      return
    }
    const responseEntity = new ResponseEntity(dto);
    const newResponse = await this.responseRepository.create(responseEntity);
    const responsesCount = await this.responseRepository.findByExecutorsId(executorId);
    const evaluationsSum = await this.responseRepository.getExecutorsEvaluationsSum(executorId);

    await this.tasksRmqClient.emit(createPattern(CommandTask.SetResponsed),{})
    await this.authRmqClient.emit(createPattern(CommandUser.UpdateUserRating),{
      _id: dto.clientId,
      evaluationsSum: evaluationsSum,
      responsesCount: responsesCount.length,
    })

    return newResponse;
  }

  async index() {
    return this.responseRepository.find();
  }

  async getByExecutorId(executorId: string) {
    return this.responseRepository.findByExecutorsId(executorId);
  }

  async delete(responseId: number) {
    await this.responseRepository.destroy(responseId);
  }
}
