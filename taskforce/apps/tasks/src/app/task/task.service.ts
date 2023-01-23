import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { addUserData, createPattern } from '@taskforce/core';
import {
  CommandComment,
  CommandUser,
  RmqServiceName,
  SortOrder,
  SortType,
  Task, TaskAction,
  TaskStatus, UserData, UserField,
  UserRole,
} from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';
import * as util from 'util';
import { CounterUpdateType } from '../../../../users/src/app/user/user.constant';
import { TaskTagRepository } from '../task-tag/task-tag.repository';
import AssignTaskDto from './dto/assign-task.dto';
import CreateTaskDto from './dto/create-task.dto';
import TaskCommentDto from './dto/task-comment.dto';
import TaskRequestDto from './dto/task-request.dto';
import UpdateTaskDto from './dto/update-task.dto';
import UploadPictureDto from './dto/upload-picture.dto';
import { FilterParams } from './query/filter-params.interface';
import { adaptTaskStatusToAction } from './task-helpers';
import { ActionConditions, StatusFlow, TaskApiError } from './task.constant';
import { TaskEntity } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {

  constructor(
    @Inject(RmqServiceName.Auth) private readonly authRmqClient: ClientProxy,
    @Inject(RmqServiceName.Comments) private readonly commentsRmqClient: ClientProxy,
    private readonly taskRepository: TaskRepository,
    private readonly tagRepository: TaskTagRepository
  ) {}

  private async validateAction(
    action: TaskAction,
    payload: UserData,
    currentTask: Task = undefined
  ): Promise<boolean | Error> {
    const { userId, userRole, executorId } = payload;

    const {
      validNextAction, validTaskClient, isClient,
      validTaskExecutor, isExecutor, isRequester,
      executorIsFree, hasExecutor, hasPicture
    } = ActionConditions[action];


    let executorHasTasks: Task[];
    if (executorIsFree && userId){
      executorHasTasks = await this.getTasks(
        {
          executorId: userId,
          status: TaskStatus.InProgress,
          sortType: SortType.CreatedAt,
          sortOrder: SortOrder.Descended})
    }

    const changesConditions = {
      validNextAction: (validNextAction !== undefined)
        ? StatusFlow[currentTask.status][userRole].includes(action)
        : validNextAction,

      validTaskClient: (validTaskClient !== undefined)
        ? currentTask.clientId === userId
        : validTaskClient,

      isClient: (isClient !== undefined)
        ? userRole === UserRole.Client
        : isClient,

      validTaskExecutor: (validTaskExecutor !== undefined)
        ? currentTask.executorId === userId
        : validTaskExecutor,

      isExecutor: (isExecutor !== undefined)
        ? userRole === UserRole.Executor
        : isExecutor,

      isRequester: (isRequester !== undefined)
        ? currentTask.requesterIds.includes(executorId)
        : isRequester,

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
    console.log('validate',isConditionsAccepted, {...ActionConditions[action]})
    if (!isConditionsAccepted) {
      return new Error(
        TaskApiError.StatusChangeConditionsIsWrong +
        ', should be ' + JSON.stringify(ActionConditions[action]) +
        ', but ' + JSON.stringify(changesConditions))
    }
    return isConditionsAccepted;
  }

  private async enrichTaskListByUserData(tasks: Task[]){
    const clients = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUsers),
        {
          userIds: tasks.map((task) => task.clientId)
        })
    );

    return addUserData(tasks, clients, UserField.Client);
  }

  private async enrichTaskByUserData(task: Task){
    const client = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUser),
        {
          userId: task.clientId
        })
    );

    return addUserData(task, client, UserField.Client);
  }

  private async updateStatusCounters(updatedTask: Task){
    const { status, clientId, executorId } = updatedTask;
    switch (status) {
      case TaskStatus.New:
        await this.authRmqClient.emit(
          createPattern(CommandUser.IncreaseCounterTasksPublished),
          {clientId: clientId}
        );
        break;
      case TaskStatus.InProgress:
        await this.authRmqClient.emit(
          createPattern(CommandUser.DecreaseCounterTasksNew),
          {clientId: clientId}
        );
        break;
      case TaskStatus.Rejected:
        await this.authRmqClient.emit(
          createPattern(CommandUser.DecreaseCounterTasksNew),
          {clientId: clientId}
        );
        break;
      case TaskStatus.Failed:
        await this.authRmqClient.emit(
          createPattern(CommandUser.IncreaseCounterTasksFailed),
          {executorId: executorId}
        );
        break;
      case TaskStatus.Done:
        await this.authRmqClient.emit(
          createPattern(CommandUser.IncreaseCounterTasksDone),
          {executorId: executorId}
        );
        break;
    }
  }

  public async create(dto: CreateTaskDto, userData: UserData) {
    const isValidAction = await this.validateAction(TaskAction.CreateTask, userData)
    if (isValidAction.toString().includes('Error')) {
      throw new InternalServerErrorException({message: isValidAction.toString()})
    }
    const taskTags = (dto?.tags?.length)
    ? await this.tagRepository.find([...dto.tags])
    : [];

    const taskEntity = new TaskEntity(
      { ...dto,
        clientId: userData.userId,
        dueDate: new Date(dto.dueDate),
        tags: taskTags,
        status: TaskStatus.New}
    );

    const newTask = await this.taskRepository.create(taskEntity);
    await this.updateStatusCounters(newTask);

    return newTask;
  }

  private async update(taskId: number, dto: Task) {
    const currentTask = await this.taskRepository.findById(taskId);
    const taskEntity = new TaskEntity({...currentTask, ...dto});
    return this.taskRepository.update(taskId, taskEntity);
  }

  public async getUnsentTasks(): Promise<Task[]> {
    return this.taskRepository.findUnsent();
  }

  public async markTasksAsSent(taskIds: number[]): Promise<HttpStatus>{
    await this.taskRepository.markAsSent(taskIds);
    return HttpStatus.NO_CONTENT
  }

  public async getNewTasks(filter: FilterParams, userData: UserData): Promise<Task[]>{
    const { userRole } = userData;
    if (userRole !== UserRole.Executor){
      return [];
    }
    const tasks = await this.getTasks({ ...filter, status: TaskStatus.New })
    return this.enrichTaskListByUserData(tasks);
  }

  public async getMyTasks(filter: FilterParams, userData: UserData): Promise<Task[]>{
    const { userRole, userId } = userData;
    let myFilter: FilterParams;
    if (userRole === UserRole.Executor){
      myFilter = { executorId: userId, sortType: SortType.Status };
    }
    else {
      myFilter = { clientId: userId, sortType: SortType.CreatedAt };
    }

    const tasks = await this.getTasks({ ...filter, ...myFilter})

    return this.enrichTaskListByUserData(tasks);
  }

  public async getTasks(filter: FilterParams): Promise<Task[]> {
    const tasks = await this.taskRepository.findByFilter(filter);

    return this.enrichTaskListByUserData(tasks);
  }
  public async getTaskById(id: number) {
    const task = await this.getTask(id);
    return this.enrichTaskByUserData(task);
  }

  private async getTask(id: number) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new  NotFoundException(TaskApiError.Id)
    }
    return task;
  }
  public async updateTaskStatus(taskId: number, dto: UpdateTaskDto, userData: UserData){
    const currentTask = await this.getTask(taskId);

    const newStatus: TaskStatus = dto?.status;
    if (!newStatus) {
      throw new BadRequestException(TaskApiError.StatusIsInvalid)
    }

    const action = adaptTaskStatusToAction(newStatus);
    await this.validateAction(action, userData, currentTask);

    const taskEntity = new TaskEntity({...currentTask, status: newStatus});
    const updatedTask = await this.taskRepository.update(taskId, taskEntity);

    await this.updateStatusCounters(updatedTask);

    return this.enrichTaskByUserData(updatedTask);
  }

  public async uploadPicture(taskId: number, dto: UploadPictureDto, userData: UserData){
    const currentTask = await this.taskRepository.findById(taskId);

    await this.validateAction(TaskAction.UploadPicture, userData, currentTask);

    const taskEntity = new TaskEntity({...currentTask, taskPicture: dto.taskPicture});
    const task = await this.taskRepository.update(taskId, taskEntity);
    return this.enrichTaskByUserData(task);
  }

  public async assignTask(taskId: number, dto: AssignTaskDto, userData: UserData){
    const currentTask = await this.getTask(taskId);

    await this.validateAction(TaskAction.SetExecutor, userData, currentTask);

    const taskEntity = new TaskEntity({...currentTask, ...dto});

    const task = await this.taskRepository.update(taskId, taskEntity);
    return this.enrichTaskByUserData(task);
  }

  public async delete(taskId: number, userData: UserData) {
    const taskToDelete = await this.getTask(taskId);

    await this.validateAction(TaskAction.DeleteTask, userData, taskToDelete);

    await this.taskRepository.destroy(taskId);

    await this.authRmqClient.emit(createPattern(
      CommandUser.DecreaseCounterTasksPublished),
      {clientId: taskToDelete.clientId}
    );

    await this.updateStatusCounters(taskToDelete);

    await this.commentsRmqClient.emit(
      createPattern(CommandComment.DeleteTaskComments),
      {taskId: taskId}
    );

    return HttpStatus.NO_CONTENT;
  }

  public async updateCommentsCount(dto: TaskCommentDto, updateType: CounterUpdateType): Promise<Task>{
    const {taskId, commentId} = dto;
    const currentTask = await this.getTask(taskId);
    currentTask.commentsCount += updateType;
    if (updateType > 0) {
      currentTask.commentIds.push(commentId);
    } else {
      currentTask.commentIds = [...currentTask.commentIds.filter(item => item !== commentId)];
    }
    return this.update(taskId, currentTask);
  }

  public async updateRequestsCount(dto: TaskRequestDto, updateType: CounterUpdateType): Promise<Task>{
    const {taskId, executorId} = dto;
    const currentTask = await this.getTask(taskId);
    currentTask.requestsCount += updateType;
    if (updateType > 0) {
      currentTask.requesterIds.push(executorId);
    } else {
      currentTask.requesterIds = [...currentTask.requesterIds.filter(item => item !== executorId)];
    }
    return this.update(taskId, currentTask);
  }

  public async validateCountersAction(
    action: TaskAction,
    userData: UserData | undefined,
    taskId: number
  ): Promise<boolean | Error> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return false;
    }

    return this.validateAction(action, userData, task)
  }

  public async validateResponseAction(
    action: TaskAction,
    userData: UserData,
    taskId: number
  ): Promise<boolean | Error> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return false;
    }

    return this.validateAction(action, userData, task)
  }
}
