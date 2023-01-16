import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { City, FileElement, User, UserRole } from '@taskforce/shared-types';
import { Document } from 'mongoose';

const USERS_COLLECTION_NAME = 'users';
@Schema({
  collection: USERS_COLLECTION_NAME,
})
export class UserModel extends Document implements User {

  @Prop({
    required: true,
  })
  public name: string;

  @Prop({
    required: true,
    unique: true,
  })
  public email: string;

  @Prop({
    required: true,
    type: String,
    enum: City,
  })
  public city: City;

  @Prop({
    required: true,
  })
  public passwordHash: string;

  @Prop()
  public refreshTokenHash?: string;

  @Prop({
    required: true,
  })
  public dateBirth: Date;

  @Prop({
    required: true,
    type: String,
    enum: UserRole,
  })
  public role: UserRole;

  @Prop({
    _id: false,
    type: FileElement
  })
  public avatar?: {
    url: string,
    name: string,
  };

  @Prop()
  public info?: string;

  @Prop()
  public taskPublishedCount?: number;

  @Prop()
  public taskNewCount?: number;

  @Prop()
  public occupations?: string[];

  @Prop()
  public rating?: number;

  @Prop()
  public rank?: number;

  @Prop()
  public taskDoneCount?: number;

  @Prop()
  public taskFailedCount?: number;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
