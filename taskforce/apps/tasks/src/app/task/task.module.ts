import { Module } from '@nestjs/common';
import { TaskCategoryModule } from '../task-category/task-category.module';
import { TaskTagModule } from '../task-tag/task-tag.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [
    TaskCategoryModule,
    TaskTagModule
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class TaskModule {}
