import { Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { NotifyService } from './notify.service';

@Controller('notify')
export class NotifyController {
  constructor(private readonly forceNotifyService: NotifyService) {
  }

  @ApiResponse({})
  @Post('new-tasks')
  public async notifyNewTasks() {
    return this.forceNotifyService.notifyNewTasks();
  }
}
