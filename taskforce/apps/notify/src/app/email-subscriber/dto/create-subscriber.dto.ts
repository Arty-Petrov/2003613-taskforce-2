import { IsEmail, IsNotEmpty } from 'class-validator';
import { EmailSubscriberApiError } from '../email-subscriber.constant';

export class CreateSubscriberDto {
  @IsEmail({}, {
    message: EmailSubscriberApiError.EmailIsNotValid
  })
  email: string;

  @IsNotEmpty({
    message: EmailSubscriberApiError.NameIsEmpty
  })
  name: string;

  @IsNotEmpty({
    message: EmailSubscriberApiError.UserIdIsEmpty
  })
  userId: string;
}
