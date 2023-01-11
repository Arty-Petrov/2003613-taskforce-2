import { City, FileElement, User, UserRole } from '@taskforce/shared-types';
import { compare, genSalt, hash } from 'bcrypt';
import { SALT_ROUNDS } from './user.constant';

export class UserEntity implements User {
  public _id: string;
  public email: string;
  public name: string;
  public city: City;
  public passwordHash: string;
  public dateBirth: Date;
  public role: UserRole;
  public avatar?: FileElement;
  public info?: string;
  public taskPublishedCount?: number;
  public taskNewCount?: number;
  public occupations?: string[];
  public rating?: number;
  public rank?: number;
  public taskDoneCount?: number;
  public taskFailedCount?: number;

  constructor(user: User) {
    this.fillEntity(user);
  }

  public async setPassword(password: string): Promise<UserEntity> {
    const salt = await genSalt(SALT_ROUNDS);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }

  public toObject() {
    return {...this};
  }

  public fillEntity(user: User) {
    this._id = user._id;
    this.email = user.email;
    this.name = user.name;
    this.city = user.city;
    this.passwordHash = user.passwordHash;
    this.dateBirth = user.dateBirth;
    this.role = user.role;
    this.avatar = user.avatar;
    this.info = user.info;

    if (user.role === UserRole.Client) {
    this.taskPublishedCount = user?.taskPublishedCount;
    this.taskNewCount = user?.taskNewCount;
    } else {
    this.occupations = user?.occupations;
    this.rating = user?.rating;
    this.rank = user?.rank;
    this.taskDoneCount = user?.taskDoneCount;
    this.taskFailedCount = user?.taskFailedCount;
    }
  }
}
