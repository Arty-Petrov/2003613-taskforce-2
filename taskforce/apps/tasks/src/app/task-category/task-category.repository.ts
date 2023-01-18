import { Injectable } from '@nestjs/common';
import { CRUDRepository } from '@taskforce/shared-types';
import { TaskCategory } from '@taskforce/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { TaskCategoryEntity } from './task-category.entity';

@Injectable()
export class TaskCategoryRepository implements CRUDRepository<TaskCategoryEntity, number, TaskCategory>{
  constructor(
  private readonly prisma: PrismaService
  ) {}

  public async create(item: TaskCategoryEntity): Promise<TaskCategory> {
    return this.prisma.category.create({
      data: { ...item.toObject() }
    });
  }

  public async find(ids: number[] = []): Promise<TaskCategory[]> {
    return this.prisma.category.findMany({
      where: {
        id: {
          in: ids.length > 0 ? ids : undefined
        }
      }
    });
  }

  public async findById(id: number): Promise<TaskCategory | null>{
    return this.prisma.category.findFirst({
      where: {
        id
      }
    });
  }

  public async update(id: number, item: TaskCategoryEntity): Promise<TaskCategory>{
    return this.prisma.category.update({
      where: {
        id
      },
      data: { ...item.toObject(), id}
    });
  }

  public async destroy(id: number): Promise<void> {
    await this.prisma.category.delete({
      where: {
        id,
      }
    });
  }
}
