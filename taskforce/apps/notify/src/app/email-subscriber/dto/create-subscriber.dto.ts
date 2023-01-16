import { UserRole } from '@taskforce/shared-types';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
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

  @IsEnum(
    UserRole,
    {
      message: EmailSubscriberApiError.RoleIsWrong
    })
  @Transform(({value}) => value as UserRole)
  public role: UserRole;
}
