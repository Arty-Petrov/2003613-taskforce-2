import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUserData, createPattern, fillObject, JwtAuthGuard } from '@taskforce/core';
import { AuthUser, CommandComment } from '@taskforce/shared-types';
import { CommentService } from './comment.service';
import CreateCommentDto from './dto/create-comment.dto';
import { CommentQuery } from './query/comment.query';
import CommentRdo from './rdo/comment.rdo';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(
    private commentService: CommentService
  ) {}

  @ApiResponse({
    type: CommentRdo,
    status: HttpStatus.OK,
    description: 'Task comment has been successfully created'
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  @UseGuards(JwtAuthGuard)
  public async create(
    @AuthUserData() user: AuthUser,
    @Body() dto: CreateCommentDto
  ) {
    const comment = await this.commentService.create(dto, user);
    return fillObject(CommentRdo, comment);
  }

  @ApiResponse({
    type: CommentRdo,
    status: HttpStatus.OK,
    description: 'Task comments is found'
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  public async index(
    @Query () query: CommentQuery,
  ) {
    const comments = this.commentService.getComments(query);
    return fillObject(CommentRdo, comments);
  }

  @ApiResponse({
    type: CommentRdo,
    status: HttpStatus.OK,
    description: 'Comment is found'
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public async show(
    @Param('id', ParseIntPipe) commentId: number,
  ) {
    const comment = await this.commentService.getById(commentId);
    return fillObject(CommentRdo, comment);
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The comment has been deleted'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  public async destroy(
    @AuthUserData() user: AuthUser,
    @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.deleteComment(commentId, user.sub);
  }

  @EventPattern(createPattern(CommandComment.DeleteTaskComments))
  public async deleteTaskComments(
    @Payload('taskId', ParseIntPipe) taskId: number
  ){
    return this.commentService.deleteCommentsByTaskId(taskId);
  }
}
