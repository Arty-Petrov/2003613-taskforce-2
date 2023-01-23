import { PickType } from '@nestjs/swagger';
import TaskDto from './task.dto';

export default class UpdateTaskDto extends PickType(TaskDto,['status'] ){}
