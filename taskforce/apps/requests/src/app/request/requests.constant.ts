export const DEFAULT_SORT_DIRECTION = 'desc';
export const DEFAULT_REQUESTS_COUNT_LIMIT = 50;
export const DEFAULT_PAGINATION_COUNT = 1;

export const enum TextLength {
  Min = 10,
  Max = 300,
}

export const RequestsApiError = {
  TextNotValid: `Comment text is out of range: min ${TextLength.Min}, max ${TextLength.Max} chars length`,
  UserRoleNotValid: 'Only user with role executor can make request',
  RequestIsNotAllowed: 'Only tasks with status "New" is allowed to requests',
} as const;

export const RequestsApiDescription = {
  Id: 'The uniq request id',
  ExecutorId: 'Uniq requester user id',
  TaskId: 'Request\'s parent task id',
  PublishAt: 'The request creation date, ISO8601 string',
  Text: `Request text, string length min ${TextLength.Min}, max ${TextLength.Max} chars`,
  CostProposal: `Task estimation executor's proposal, zero or positive number`,
} as const;
