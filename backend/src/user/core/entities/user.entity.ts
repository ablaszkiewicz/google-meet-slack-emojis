import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IUser } from "./user.interface";
import { HydratedDocument } from "mongoose";

@Schema({ collection: "users" })
export class UserEntity {
  _id: string;

  @Prop()
  email: string;

  @Prop()
  slackUserId: string;

  @Prop()
  slackTeamId: string;

  @Prop()
  slackTeamName: string;

  @Prop()
  name: string;

  @Prop()
  avatar: string;

  @Prop({ select: false })
  slackBotToken: string;

  public static mapToInterface(user: UserEntity): IUser {
    return {
      ...(user as any),
      slackBotToken: undefined,
      id: user._id.toString(),
    };
  }
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.index(
  { slackTeamId: 1, slackUserId: 1 },
  { unique: true, sparse: true }
);
