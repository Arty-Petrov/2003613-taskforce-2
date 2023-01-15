import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SortOrder, SortType, Task, TaskStatus, UserRole } from '@taskforce/shared-types';
import * as util from 'util';
import { TaskTagRepository } from '../task-tag/task-tag.repository';
import { ActionData } from './action-data.interface';
import CreateTaskDto from './dto/create-task.dto';
import UpdateTaskDto from './dto/update-task.dto';
import { FilterParams } from './query/filter-params.interface';
import { StatusChangePayload } from './status-change-payload.interface';
import { adaptTaskStatusToAction } from './task-helpers';
import { ActionConditions, StatusFlow, TaskAction, TaskApiError } from './task.constant';
import { TaskEntity } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly tagRepository: TaskTagRepository
  ) {}

  private async validateAction(
    action: TaskAction,
    currentTask: Task,
    payload: StatusChangePayload
  ): Promise<void> {
    const {userRole, clientId, executorId} = payload;
    const {
      validNextAction, validTaskClient, validTaskExecutor, isApplicant,
      executorIsFree, hasExecutor, hasPicture
    } = ActionConditions[action];

    let executorHasTasks: Task[];
    if (executorIsFree && executorId){
      executorHasTasks = await this.getTasks(
        {executorId: executorId, status: TaskStatus.InProgress, sortType: SortType.CreatedAt, sortOrder: SortOrder.Descended})
    }

    const changesConditions = {
      validNextAction: (validNextAction !== undefined)
        ? StatusFlow[currentTask.status][userRole].includes(action)
        : validNextAction,

      validTaskClient: (validTaskClient !== undefined)
        ? currentTask.clientId === clientId
        : validTaskClient,

      validTaskExecutor: (validTaskExecutor !== undefined)
        ? currentTask.executorId === executorId
        : validTaskExecutor,

      isApplicant: (isApplicant !== undefined)
        ? currentTask.applicantsIds.includes(executorId)
        : isApplicant,

      hasExecutor: (hasExecutor !== undefined)
        ? currentTask.executorId !== null
        : hasExecutor,

      executorIsFree: (executorIsFree !== undefined)
        ? !executorHasTasks?.length
        : executorIsFree,

      hasPicture: (hasPicture !== undefined)
        ? currentTask.taskPicture !== null
        : hasPicture,
    }

    const isConditionsAccepted = util
      .isDeepStrictEqual(
        ActionConditions[action],
        changesConditions
      );

    if (!isConditionsAccepted) {
      throw new InternalServerErrorException(
        TaskApiError.StatusChangeConditionsIsWrong +
        ', should be ' + JSON.stringify(ActionConditions[action]) +
        ', but ' + JSON.stringify(changesConditions))
    }
  }

  async create(dto: CreateTaskDto) {
    const taskTags = (dto?.tags?.length)
    ? await this.tagRepository.find([...dto.tags])
    : [];
    const date = new Date(dto.dueDate);
    const taskEntity = new TaskEntity({ ...dto, dueDate: date, tags: taskTags, status: TaskStatus.New});
    return this.taskRepository.create(taskEntity);
  }
  async getUnsentTasks(): Promise<Task[]> {
    return this.taskRepository.findUnsent();
  }

  async markTasksAsSent(taskIds: number[]): Promise<HttpStatus>{
    await this.taskRepository.markAsSent(taskIds);
    return HttpStatus.NO_CONTENT
  }

  async getNewTasks(filter: FilterParams, user: ActionData): Promise<Task[]>{
    const { userRole } = user;
    if (userRole !== UserRole.Executor){
      return [];
    }
    return this.getTasks({ ...filter, status: TaskStatus.New })
  }

  async getMyTasks(filter: FilterParams, user: ActionData): Promise<Task[]>{
    const { userRole, userId } = user;
    let myFilter: FilterParams;
    if (userRole === UserRole.Executor){
      myFilter = { executorId: userId, sortType: SortType.Status };
    }
    else {
      myFilter = { clientId: userId, sortType: SortType.CreatedAt };
    }
    return this.getTasks({ ...filter, ...myFilter})
  }

  async getTasks(filter: FilterParams): Promise<Task[]> {
    return this.taskRepository.findByFilter(filter);
  }

  async getTaskById(id: number) {
    return this.taskRepository.findById(id);
  }
  async updateTaskStatus(taskId: number, dto: UpdateTaskDto, user: ActionData){
    const { userId, userRole } = user;

    let statusChangePayload: StatusChangePayload;
    const currentTask = await this.taskRepository.findById(taskId);

    const newStatus: TaskStatus = dto?.status;
    if (!newStatus) {
      throw new BadRequestException(TaskApiError.StatusIsInvalid)
    }

    if (userRole === UserRole.Executor){
      statusChangePayload = { executorId: userId, userRole: userRole};
    }
    else {
      statusChangePayload = { clientId: userId, userRole: userRole };
    }


    const action = adaptTaskStatusToAction(newStatus);
    await this.validateAction(action, currentTask, statusChangePayload);

    const taskEntity = new TaskEntity({...currentTask, status: newStatus});
    return this.taskRepository.update(taskId, taskEntity);
  }

  async uploadPicture(taskId: number, dto: UpdateTaskDto, user: ActionData){
    const { userId, userRole } = user;
    const currentTask = await this.taskRepository.findById(taskId);

    await this.validateAction(TaskAction.UploadPicture, currentTask, {userRole: userRole, clientId: userId});

    const taskEntity = new TaskEntity({...currentTask, taskPicture: dto.taskPicture});
    return this.taskRepository.update(taskId, taskEntity);
  }

  async update(taskId: number, dto: UpdateTaskDto) {
    const currentTask = await this.taskRepository.findById(taskId);
    const taskEntity = new TaskEntity({...currentTask, ...dto});
    return this.taskRepository.update(taskId, taskEntity);
  }

  async delete(taskId: number) {
    await this.taskRepository.destroy(taskId);
  }

}
