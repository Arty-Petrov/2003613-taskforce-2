import { UserRole } from '@taskforce/shared-types';

export const EmailSubscriberApiError = {
  EmailIsNotValid: 'The email is not valid',
  NameIsEmpty: 'The name is empty',
  UserIdIsEmpty: 'The userId is empty',
  EmailSubscriberExists: 'The subscriber with same email already exists',
  RoleIsWrong: `User role field must contains any of these values: ${Object.values(UserRole).join(', ')}`,
}

export const EmailSubscriberApiDescription = {

}
