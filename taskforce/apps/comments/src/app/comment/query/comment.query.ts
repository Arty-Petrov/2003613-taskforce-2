import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { DEFAULT_COMMENT_COUNT_LIMIT, DEFAULT_PAGINATION_COUNT, DEFAULT_SORT_DIRECTION } from '../comment.constant';



export class CommentQuery {
  @Transform(({ value } ) => +value)
  @IsNumber()
  public taskId: number;

  @Transform(({ value } ) => +value || DEFAULT_COMMENT_COUNT_LIMIT)
  @IsNumber()
  @IsOptional()
  public limit = DEFAULT_COMMENT_COUNT_LIMIT;

  @IsIn(['asc', 'desc'])
  @IsOptional()
  public sortDirection: 'desc' | 'asc' = DEFAULT_SORT_DIRECTION;

  @Transform(({ value }) => +value)
  @IsOptional()
  public page?: number = DEFAULT_PAGINATION_COUNT;
}
