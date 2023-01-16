export enum CommandMessage {
  GetNewTasks = 'getNewTasks',
  GetSubscribers = 'getRecipients',
  SendNewTasks = 'sendNewTasks',
  MarkTasksAsSent = 'markTasksAsSent',
  IncreaseCounterTasks = 'increaseCounterTasks',
  IncreaseComments = 'increaseCounterComments',
  IncreaseCounterApplicants = 'increaseCounterApplicants',
  IncreaseCounterTasksFailed = 'increaseCounterTasksFailed',
  IncreaseCounterTasksDone = 'increaseCounterTasksDone',
  IncreaseCounterTasksPublished = 'increaseCounterTasksPublished',
  IncreaseCounterTasksNew = 'increaseCounterTasksNew',
  DecreaseCounterTasksNew = 'decreaseCounterTasksNew',
}
