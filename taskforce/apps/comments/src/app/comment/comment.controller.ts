import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { fillObject } from '@taskforce/core';
import { CommentService } from './comment.service';
import CreateCommentDto from './dto/create-comment.dto';
import { CommentQuery } from './query/comment.query';
import CommentRdo from './rdo/comment.rdo';

@Controller('comment')
export class CommentController {
  constructor(
    private commentService: CommentService
  ) {}

  @Post('/')

  public async create(
    @Body() dto: CreateCommentDto
  ) {
    const newComment = await this.commentService.create(dto);
    return fillObject(CommentRdo, newComment);
  }

  @Get('/:id')

  public async show(@Param('id', ParseIntPipe) id: string) {
    const commentId = parseInt(id, 10);
    const comment = await this.commentService.getCommentById(commentId);
    return fillObject(CommentRdo, comment);
  }

  @Get('/')

  public async index(@Query () query: CommentQuery) {
    const comments = await this.commentService.getComments(query);
    return fillObject(CommentRdo, comments);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)

  public async destroy(@Param('id', ParseIntPipe) id: number) {
    /*
    Logic for checking if user is not owner of the comment
    const { authorId } = await this.commentService.getCommentById(id);
    if (userId !== authorId ) {
      throw new UnauthorizedException('User can delete own comment only')
    }
    */
    await this.commentService.deleteComment(id);
  }

  @Delete('/:taskId/task')
  @HttpCode(HttpStatus.NO_CONTENT)

  public async destroyTaskComments(
    @Param('taskId', ParseIntPipe) taskId: number
  ) {
    await this.commentService.deleteCommentsByTaskId(taskId);
  }
}
