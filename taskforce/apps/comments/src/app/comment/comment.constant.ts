import { TaskStatus } from '@taskforce/shared-types';

export const DEFAULT_SORT_DIRECTION = 'desc';
export const DEFAULT_COMMENT_COUNT_LIMIT = 50;
export const DEFAULT_PAGINATION_COUNT = 1;

export const enum TextLength {
  Min = 10,
  Max = 300,
}

export const CommentApiError = {
  TextNotValid: `Comment text is out of range: min ${TextLength.Min}, max ${TextLength.Max} chars length`,
  Unauthorised: 'Only TaskForce registered users allowed to comment a task',
  CommentIsNotAllowed: `Only tasks with status "${TaskStatus.New}" and "${TaskStatus.InProgress}" is allowed to comment`,
} as const;

export const CommentApiDescription = {
  Id: 'The uniq comment id',
  AuthorId: 'Uniq requester user id',
  TaskId: 'Request\'s parent task id',
  PublishAt: 'The request creation date, ISO8601 string',
  Text: `Request text, string length min ${TextLength.Min}, max ${TextLength.Max} chars`,
} as const;
