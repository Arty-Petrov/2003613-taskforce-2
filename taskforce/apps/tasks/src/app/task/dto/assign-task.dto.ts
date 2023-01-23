import { ApiProperty } from '@nestjs/swagger';

export default class AssignTaskDto {
  @ApiProperty({
  description: 'Task executor id',
  example: 'd04eb35d-c36f-4e2b-b828-136379c7c6e3'
  })
  public executorId: string;
}
