import { Injectable } from '@nestjs/common';
import { City, CRUDRepository, FileElement, SortOrder, SortType, Task, TaskStatus } from '@taskforce/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { FilterParams } from './query/filter-params.interface';
import { TaskEntity } from './task.entity';
import { Task as Entry } from '.prisma/tasks-client';

@Injectable()
export class TaskRepository implements CRUDRepository<TaskEntity, number, Task>{
  constructor(
    private readonly prisma: PrismaService
  ) {}

  private async adaptEntryToTask(entry: Entry): Promise<Task | null> {
    if (!entry) {
      return null;
    }
    return {
      ...entry,
      taskPicture: entry.taskPicture as FileElement,
      city: entry.city as City,
      status: entry.status as TaskStatus,
    };
  }

  private async adaptEntriesToTask(entries: Entry[]): Promise<Task[]> {
    if (entries.length) {
      return entries as Task[]
    }
    let tasks: Task[] = [];
    for (const entry of entries)  {
      const task = await this.adaptEntryToTask(entry);
      tasks.push(task);
    }
    return tasks;
  }

  public async create(item: TaskEntity): Promise<Task> {
    const entityData = item.toObject();
    delete entityData.id
    const task = await this.prisma.task.create({
      data: {
        title: entityData.title,
        description: entityData.description,
        clientId: entityData.clientId,
        categoryId: entityData.categoryId,
        status: entityData.status,
        city: entityData.city,
        address: entityData.address,
        dueDate: entityData.dueDate,
        publishAt: entityData.publishAt,
        budget: entityData.budget,

        tags: {
          connect: [...entityData.tags]
        },
      },
      include: {
        category: true,
        tags: true,
      }
    });
    return this.adaptEntryToTask(task);
  }

  public async findByFilter({
    executorId, clientId, categoryId, status,
    city, tag, sortOrder, sortType, page, limit
    }: FilterParams) {
    sortOrder = sortOrder?? SortOrder.Descended;
    sortType = sortType?? SortType.CreatedAt;

    const tasks = await this.prisma.task.findMany({
      where: {
        status: status,
        clientId: clientId,
        executorId: executorId,
        categoryId: categoryId,
        city: city,
        tags: {
          some: { title: tag },
        },
      },
      take: limit,
      include: {
        tags: true,
        category: true,
        },
      orderBy: [
        {
          [sortType]: sortOrder,
        },

      ],
      skip: page > 0 ? limit * (page - 1) : undefined,
    });
    return this.adaptEntriesToTask(tasks);
  }

  public async findUnsent(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        isSent: false,
      },
      include: {
        category: true,
      }
    });
    return this.adaptEntriesToTask(tasks);
  }

  public async markAsSent(taskIds: number[]): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: {in: taskIds},
      },
      data: {
        isSent: true,
      },
    });
  }

  public async findById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
      },
      include: {
        tags: true,
        category: true,
      }
    });

    return this.adaptEntryToTask(task);
  }

  public async update(id: number, item: TaskEntity): Promise<Task> {
    const entityData = item.toObject();
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        status: entityData.status,
        publishAt: entityData.publishAt,
        taskPicture: entityData.taskPicture as string,
        executorId: entityData.executorId,
        requestsCount: entityData.requestsCount,
        requesterIds: entityData.requesterIds,
        commentsCount: entityData.commentsCount,
        commentIds: entityData.commentIds,
        isResponsed: entityData.isResponsed,
      },
      include: {
        tags: true,
        category: true,
      }
    });
    return this.adaptEntryToTask(updatedTask);
  }

  public async destroy(id: number): Promise<void> {
    await this.prisma.task.delete({
      where: {
        id,
      }
    });
  }
}
