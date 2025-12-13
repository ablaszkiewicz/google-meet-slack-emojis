import { Injectable } from "@nestjs/common";
import { IUser } from "../core/entities/user.interface";
import { InjectModel } from "@nestjs/mongoose";
import { UserEntity } from "../core/entities/user.entity";
import { Model } from "mongoose";

export type UserWithSlackBotToken = {
  user: IUser;
  slackBotToken: string;
};

@Injectable()
export class UserReadService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>
  ) {}

  public async readById(id: string): Promise<IUser | null> {
    const user = await this.userModel.findById(id).lean<UserEntity>().exec();

    if (!user) {
      return null;
    }

    return UserEntity.mapToInterface(user);
  }

  public async readByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel
      .findOne({ email: email })
      .lean<UserEntity>()
      .exec();

    if (!user) {
      return null;
    }

    return UserEntity.mapToInterface(user);
  }

  public async readByEmailWithAllFields(
    email: string
  ): Promise<UserEntity | null> {
    return this.userModel.findOne({ email: email }).lean<UserEntity>().exec();
  }
}
