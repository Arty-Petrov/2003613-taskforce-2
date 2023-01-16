import { Entity, UserRole } from '@taskforce/shared-types';
import { Subscriber } from '@taskforce/shared-types';

export class EmailSubscriberEntity implements Entity<EmailSubscriberEntity>, Subscriber {
  public id: string;
  public email: string;
  public name: string;
  public userId: string;
  public role: UserRole;

  constructor(emailSubscriber: Subscriber) {
    this.fillEntity(emailSubscriber);
  }

  public fillEntity(entity) {
    this.email = entity.email;
    this.userId = entity.userId;
    this.name = entity.name;
    this.id = entity.id ?? '';
    this.role = entity.role;
  }

  public toObject(): EmailSubscriberEntity {
    return { ...this };
  }
}
