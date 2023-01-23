import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AllExceptionsFilter,
  AuthUserData,
  createMulterOptions,
  createPattern,
  fillObject,
  JwtAuthGuard,
} from '@taskforce/core';
import { ActionData, AuthUser, CommandTask, UserData } from '@taskforce/shared-types';
import { CounterUpdateType } from '../../../../users/src/app/user/user.constant';
import AssignTaskDto from './dto/assign-task.dto';
import CreateTaskDto from './dto/create-task.dto';
import TaskCommentDto from './dto/task-comment.dto';
import TaskRequestDto from './dto/task-request.dto';
import UpdateTaskDto from './dto/update-task.dto';
import UploadPictureDto from './dto/upload-picture.dto';
import { TaskQuery } from './query/task.query';
import TaskRdo from './rdo/task.rdo';
import { MAX_FILE_SIZE, ResponseGroup } from './task.constant';
import { TaskService } from './task.service';

const multerOptions = createMulterOptions(MAX_FILE_SIZE);

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService
  ) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.CREATED,
    description: 'The new task was successfully created.'
  })
  public async create(
    @AuthUserData() user: AuthUser,
    @Body() dto: CreateTaskDto
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    const newTask = await this.taskService.create(dto, userData);
    return fillObject(TaskRdo, newTask);
  }

  @Get(':id/show')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The task is found.'
  })
  public async show(
    @Param('id', ParseIntPipe)
      taskId: number
  ) {
    const existTask = await this.taskService.getTaskById(taskId);
    return fillObject(TaskRdo, existTask);
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The new task was successfully created.'
  })
  public async index(
    @AuthUserData() user: AuthUser,
    @Query () query: TaskQuery
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    const tasks = await this.taskService
      .getNewTasks(query, userData);
    return fillObject(TaskRdo, tasks);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The new task was successfully created.'
  })
  public async getMyTasks(
    @AuthUserData() user: AuthUser,
    @Query () query: TaskQuery,
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    const tasks = await this.taskService
      .getMyTasks(query, userData);
    return fillObject(TaskRdo, tasks);
  }

  @Patch('/:taskId/status')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The task data has been successfully updated.'
  })
  public async updateTask(
    @AuthUserData() user: AuthUser,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    console.log('userData', {...userData});
    const updatedTask = await this.taskService.updateTaskStatus(taskId, dto, userData);
    return fillObject(TaskRdo, updatedTask);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The new task was successfully created.'
  })
  public async destroy(
    @AuthUserData() user: AuthUser,
    @Param('id', ParseIntPipe) taskId: number
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    await this.taskService.delete(taskId, userData);
  }

  @Post('/:taskId/picture')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'Task picture has been successfully uploaded'
  })
  @UseInterceptors(FileInterceptor('picture', multerOptions))
  public async uploadTaskPicture(
    @AuthUserData() user: AuthUser,
    @Param('taskId', ParseIntPipe) taskId: number, @UploadedFile() file: any
  ) {
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
    }
    const dto: UploadPictureDto = {
      taskPicture: {
        url: file.path,
        name: file.filename,
      },
    };
    const updatedTask = await this.taskService.uploadPicture(taskId, dto, userData);
    return fillObject(TaskRdo, updatedTask, [ResponseGroup.Picture]);
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Task has been successfully assigned'
  })
  @Patch('/:taskId/assign')
  @UseGuards(JwtAuthGuard)
  public async assignTask(
    @AuthUserData() user: AuthUser,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AssignTaskDto,
  ) {
    console.log('assign');
    const userData: UserData = {
      userId: user.sub,
      userRole: user.role,
      executorId: dto.executorId,
    }
    return await this.taskService.assignTask(taskId, dto, userData)
  }

  @MessagePattern(createPattern(
    CommandTask.GetUnsentTasks
    ))
  public async getUnsentTasks(
    @Payload() data: any,
  ){
    const unsentTasks = this.taskService.getUnsentTasks()
    return fillObject(TaskRdo, unsentTasks);
  }

  @UseFilters(new AllExceptionsFilter())
  @MessagePattern(createPattern(
    CommandTask.ValidateCounterAction
  ))
  public async validateCountersAction(
    @Payload() dto: ActionData,
  ){
    const {action, userId, userRole, taskId} = dto;
    let userData: UserData = {
      userId: userId,
      userRole: userRole,
    }
    return this.taskService
      .validateCountersAction(action, userData, taskId);
  }

  @UseFilters(new AllExceptionsFilter())
  @MessagePattern(createPattern(
    CommandTask.ValidateResponse
  ))
  public async validateResponseAction(
    @Payload() dto: ActionData,
  ){
    const {action, userId, userRole, taskId} = dto;
    let userData: UserData = {
      userId: userId,
      userRole: userRole,
    }

    return this.taskService
      .validateResponseAction(action, userData, taskId);
  }

  @EventPattern(createPattern(
    CommandTask.IncreaseCounterComments
  ))
  public async increaseComments(
    @Payload() dto: TaskCommentDto
  ){
    return this.taskService.updateCommentsCount(dto, CounterUpdateType.Increase);
  }

  @EventPattern(createPattern(
    CommandTask.DecreaseCounterComments
  ))
  public async decreaseComments(
    @Payload() dto: TaskCommentDto
  ){
    return this.taskService.updateCommentsCount(dto, CounterUpdateType.Decrease);
  }

  @EventPattern(createPattern(
    CommandTask.IncreaseCounterRequests
  ))
  public async increaseRequests(
    @Payload() dto: TaskRequestDto
  ){
    return this.taskService.updateRequestsCount(dto, CounterUpdateType.Increase);
  }

  @EventPattern(createPattern(
    CommandTask.MarkTasksAsSent
  ))
  public async markTasksAsSent(
    @Payload('taskIds') taskIds: number[]
  ){
    await this.taskService.markTasksAsSent(taskIds);
  }
}
