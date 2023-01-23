import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { addUserData, createPattern } from '@taskforce/core';
import { AuthUser, CommandTask, CommandUser, RmqServiceName, TaskAction, UserField } from '@taskforce/shared-types';
import { lastValueFrom } from 'rxjs';
import CommentEntity from './comment.entity';
import CommentRepository from './comment.repository';
import CreateCommentDto from './dto/create-comment.dto';
import { CommentQuery } from './query/comment.query';

@Injectable()
export class CommentService {

  constructor(
    @Inject(RmqServiceName.Auth) private authRmqClient: ClientProxy,
    @Inject(RmqServiceName.Tasks) private tasksRmqClient: ClientProxy,
    private readonly commentRepository: CommentRepository
  ) {}

  async create(dto: CreateCommentDto, user: AuthUser) {
    const isValidComment = await lastValueFrom(
      this.tasksRmqClient.send(
        createPattern(CommandTask.ValidateCounterAction),
        {
          action: TaskAction.AddComment,
          userId: user.sub,
          userRole: user.role,
          taskId: dto.taskId
        })
    );
    if (!isValidComment) {
      throw new ForbiddenException({message: 'Comment isn\'t allowed, check if task status or its existent'})
    }
    const commentEntity = new CommentEntity({...dto, authorId: user.sub});
    const comment = await this.commentRepository.create(commentEntity);

    await this.tasksRmqClient.emit(
      createPattern(CommandTask.IncreaseCounterComments),
      {
        taskId: comment.taskId,
        commentId: comment.id,
      });

    const author = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUser),
        {
          userId: comment.authorId,
        })
    );

    return addUserData(comment, author, UserField.Author)
  }


  async getComments(query: CommentQuery) {
    const comments = await this.commentRepository.find(query);

    const authors = await lastValueFrom(
      this.authRmqClient.send(
        createPattern(CommandUser.GetUsers),
        {
          userIds: comments.map((comment) => comment.authorId)
        })
    );

    return addUserData(comments, authors, UserField.Author)
  }

  async getById(commentId: number) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment){
      throw new NotFoundException();
    }
    return comment;
  }

  async deleteComment(commentId: number, userId: string) {
    const comment = await this.getById(commentId);
    if (userId !== comment.authorId) {
      throw new UnauthorizedException();
    }

    await this.commentRepository.destroy(commentId);
    await this.tasksRmqClient.emit(
      createPattern(CommandTask.DecreaseCounterComments),
      {
        taskId: comment.taskId,
        commentId: commentId
      },
    );
    return HttpStatus.NO_CONTENT;
  }

  async deleteCommentsByTaskId(taskId: number) {
    await this.commentRepository.destroyByTaskId(taskId);
    return HttpStatus.NO_CONTENT;
  }
}
