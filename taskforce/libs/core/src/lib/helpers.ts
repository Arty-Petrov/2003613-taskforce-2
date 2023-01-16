import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommandEvent, CommandMessage, Routes } from '@taskforce/shared-types';
import {plainToInstance, ClassConstructor} from 'class-transformer';
import * as dayjs from 'dayjs';
import { Express } from 'express';
import { ensureDir } from 'fs-extra';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function fillObject<T, V>(dto: ClassConstructor<T>, plainObject: V, groups: string[] = []) {
  const options = (!groups.length)
    ? {excludeExtraneousValues: true}
    : {excludeExtraneousValues: true, groups: [...groups]};

  return plainToInstance(dto, plainObject, {...options});
}

export function getMongoConnectionString({username, password, host, port, databaseName, authDatabase}): string {
  return `mongodb://${username}:${password}@${host}:${port}/${databaseName}?authSource=${authDatabase}`;
}

export function createMulterOptions(maxFileSize: number) {
  return {
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(null, true);
      } else {
        cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
      }
    },
    storage: diskStorage({
      destination: async (req: any, file: Express.Multer.File, cb: any) => {
        const rootDir = process.env.MULTER_DEST;

        const { user, url, id } = req;

        const categoryDir = Object.values(Routes).filter((route) => url.includes(route));
        if (!categoryDir) {
          throw new NotFoundException();
        }

        const userId = user._id;
        const routeId = (id) ? `-${id}` : '';

        const timestamp = `-${dayjs().unix()}`
        const uploadDir = `${rootDir}/${categoryDir}/${userId}${routeId}${timestamp}`
        await ensureDir(uploadDir);
        cb(null, uploadDir);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(null, `${file.originalname}`);
      },
    }),
  }
}

export function createPattern(command: CommandEvent | CommandMessage){
  return { cmd: command };
}

