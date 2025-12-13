import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from './user.interface';
import { HydratedDocument } from 'mongoose';
import { AuthMethod } from '../enum/auth-method.enum';

@Schema({ collection: 'users' })
export class UserEntity {
  _id: string;

  @Prop()
  email: string;

  @Prop()
  authMethod: AuthMethod;

  @Prop()
  passwordHash?: string;

  @Prop({ type: Date })
  lastActivityDate: string;

  public static mapToInterface(user: UserEntity): IUser {
    return {
      ...user,
      id: user._id.toString(),
    };
  }
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);
