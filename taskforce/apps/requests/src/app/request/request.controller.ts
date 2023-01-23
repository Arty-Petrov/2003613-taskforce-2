import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUserData, fillObject, JwtAuthGuard } from '@taskforce/core';
import { AuthUser } from '@taskforce/shared-types';
import CreateRequestDto from './dto/create-request.dto';
import RequestRdo from './rdo/request.rdo';
import { RequestService } from './request.service';

@ApiTags('requests')
@Controller('requests')
export class RequestController {
  constructor(
    private requestService: RequestService
  ) {}

  @Get('/:taskId')
  async findRequestsByTaskId(
    @Param('taskId', ParseIntPipe) taskId: number
  ) {
    const requests = await this.requestService.getRequestsByTaskId(taskId);
    return fillObject(RequestRdo, requests);
  }

  @ApiResponse({
    type: RequestRdo,
    status: HttpStatus.OK,
    description: 'Task request has been successfully created'
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @AuthUserData() user: AuthUser,
    @Body() dto: CreateRequestDto
  ) {
    console.log('request controller', {...dto}, {...user});
    const newRequest = await this.requestService.create(dto, user);
    return fillObject(RequestRdo, newRequest);
  }
}
