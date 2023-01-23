import { PickType } from '@nestjs/swagger';
import TaskDto from './task.dto';


export default class CreateTaskDto extends PickType(TaskDto,
  [
  'title', 'description', 'clientId',
  'categoryId', 'city', 'address',
  'dueDate', 'budget', 'tags',
  ]
) {}
