import { PickType } from '@nestjs/swagger';
import TaskDto from './task.dto';

export default class UploadPictureDto extends PickType(TaskDto, ['taskPicture']){}
