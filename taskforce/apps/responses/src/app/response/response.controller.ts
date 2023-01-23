import { Body, Controller, Get, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUserData, fillObject, JwtAuthGuard } from '@taskforce/core';
import { AuthUser, UserRole } from '@taskforce/shared-types';
import CreateResponseDto from './dto/create-response.dto';
import ResponseRdo from './rdo/response.rdo';
import { ResponseService } from './response.service';

@ApiTags('responses')
@Controller('responses')
export class ResponseController {
  constructor(
    private responseService: ResponseService
  ) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  async create(
    @AuthUserData() user: AuthUser,
    @Body() dto: CreateResponseDto) {
    if (user.role !== UserRole.Client) {
    throw new UnauthorizedException();
    }
    const newResponse = await this.responseService.create({...dto, clientId: user.sub});
    return fillObject(ResponseRdo, newResponse);
  }

  @Get('/:executorId')
  async indexExecutorEvaluations(@Param('executorId') executorId: string) {
    const responses = await this.responseService.getByExecutorId(executorId);
    return fillObject(ResponseRdo, responses);
  }
}
