import { Injectable } from '@nestjs/common';
import { CRUDRepository } from '@taskforce/shared-types';
import { Response } from '@taskforce/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import ResponseEntity from './response.entity';

@Injectable()
export default class ResponseRepository implements CRUDRepository<ResponseEntity, number, Response> {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  public async create(item: ResponseEntity): Promise<Response> {
    const entityData = item.toObject();
    return this.prisma.response.create({
      data: {
        ...entityData,
      }
    });
  }

  public async find(): Promise<Response[]> {
    return [];
  }

  public async findByExecutorsId(executorId: string): Promise<Response[]> {
    return this.prisma.response.findMany({
      where: {
        executorId: executorId,
      },
      });
    }

  public async findByTaskId(taskId: number): Promise<Response | null> {
    return this.prisma.response.findFirst({
      where: {
        taskId: taskId,
      },
    });
  }

  public async update(id: number, item: ResponseEntity): Promise<Response>{
    return Promise.resolve(undefined);
  }

  public async destroy(id: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async findById(id: number): Promise<Response | null> {
    return Promise.resolve(undefined);
  }

  public async getExecutorsEvaluationsSum (executorId: string): Promise<number> {
    const evaluationsSum = await this.prisma.response.aggregate({
      _sum: {
        evaluation: true,
      },
      where: {
        executorId: executorId,
        },
    });
    return evaluationsSum._sum.evaluation;
  }
}
