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
  UseInterceptors,
} from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { createMulterOptions, createPattern, fillObject } from '@taskforce/core';
import { CommandMessage, UserRole } from '@taskforce/shared-types';
import { ActionData } from './action-data.interface';

import CreateTaskDto from './dto/create-task.dto';
import UpdateTaskDto from './dto/update-task.dto';
import { TaskQuery } from './query/task.query';
import TaskRdo from './rdo/task.rdo';
import { MAX_FILE_SIZE, ResponseGroup, TaskAction } from './task.constant';
import { TaskService } from './task.service';

const multerOptions = createMulterOptions(MAX_FILE_SIZE);

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService
  ) {}

  @Post('/')
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.CREATED,
    description: 'The new task was successfully created.'
  })
  async create(@Body() dto: CreateTaskDto){
    const newTask = await this.taskService.create(dto);
    return fillObject(TaskRdo, newTask);
  }

  @Get(':id/show')
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The task is found.'
  })
  async show(@Param('id') id: string){
    const taskId = parseInt(id, 10);
    const existTask = await this.taskService.getTaskById(taskId);
    return fillObject(TaskRdo, existTask);
  }

  @Get('/')
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The new task was successfully created.'
  })
  async index(@Query () query: TaskQuery){
    //Hardcode before Rabbit implementation
    const userRole = UserRole.Executor
    const tasks = await this.taskService
      .getNewTasks(query, {userRole: userRole});
    return fillObject(TaskRdo, tasks);
  }

  @Get('my')
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The new task was successfully created.'
  })
  async getMy(@Query () query: TaskQuery){
    //Hardcode before Rabbit implementation
    const userId = '12';
    const userRole = UserRole.Executor
    const tasks = await this.taskService
      .getMyTasks(query, {userRole: userRole, userId: userId});
    return fillObject(TaskRdo, tasks);
  }

  @Patch('/:taskId/status')
  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'The task data has been successfully updated.'
  })
  async updateTask(@Param('taskId', ParseIntPipe) taskId: number, @Body() dto: UpdateTaskDto){
    //Hardcode before Rabbit implementation
    const actionData: ActionData = {
      userId: '13',
      userRole: UserRole.Client,
    }
    const updatedTask = await this.taskService.updateTaskStatus(taskId, dto, actionData);
    return fillObject(TaskRdo, updatedTask);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The new task was successfully created.'
  })
  async destroy(@Param('id') id: string){
    const taskId = parseInt(id, 10);
    await this.taskService.delete(taskId);
  }

  @ApiResponse({
    type: TaskRdo,
    status: HttpStatus.OK,
    description: 'Task picture has been successfully uploaded'
  })
  @Post('/:taskId/picture')
  // WIP @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('picture', multerOptions))
  public async uploadTaskPicture(@Param('taskId', ParseIntPipe) taskId: number, @UploadedFile() file: any) {
    //Hardcode before Rabbit implementation
    const user: ActionData = {
      userId: '13',
      userRole: UserRole.Client,
      action: TaskAction.UploadPicture
    }
    const dto: UpdateTaskDto = {
      taskPicture: {
        url: file.path,
        name: file.filename,
      },
    };

    const updatedTask = await this.taskService.uploadPicture(taskId, dto, user);
    return fillObject(TaskRdo, updatedTask, [ResponseGroup.Picture]);
  }

  @MessagePattern(createPattern(
    CommandMessage.GetNewTasks
    ))
  public async getNewTask(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ){
    const unsentTasks = this.taskService.getUnsentTasks()
    return fillObject(TaskRdo, unsentTasks);
  }

  @EventPattern(createPattern(
    CommandMessage.MarkTasksAsSent
  ))
  public async markTasksAsSent(
    @Payload('taskIds') taskIds: number[]
  ){
    await this.taskService.markTasksAsSent(taskIds);
  }
}
