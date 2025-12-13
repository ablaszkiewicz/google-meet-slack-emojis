import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserEntity } from "../core/entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { IUser } from "../core/entities/user.interface";
import { UpsertSlackUserDto } from "./dto/upsert-slack-user.dto";
import { AuthMethod } from "../core/enum/auth-method.enum";

@Injectable()
export class UserWriteService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>
  ) {}

  public async createUser(dto: CreateUserDto): Promise<IUser> {
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
      authMethod: dto.authMethod,
      lastActivityDate: new Date(),
    });

    return UserEntity.mapToInterface(user);
  }

  public async upsertSlackUser(dto: UpsertSlackUserDto): Promise<IUser> {
    const user = await this.userModel
      .findOneAndUpdate(
        { slackTeamId: dto.slackTeamId, slackUserId: dto.slackUserId },
        {
          $set: {
            email: dto.email,
            authMethod: AuthMethod.Slack,
            slackUserId: dto.slackUserId,
            slackTeamId: dto.slackTeamId,
            slackTeamName: dto.slackTeamName,
            slackUserName: dto.slackUserName,
            slackUserAvatar: dto.slackUserAvatar,
            slackBotToken: dto.slackBotToken,
            lastActivityDate: new Date(),
          },
        },
        { upsert: true, new: true }
      )
      .exec();

    return UserEntity.mapToInterface(user);
  }

  public async updateLastActivityDate(
    userId: string,
    date: Date
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { lastActivityDate: date }
    );
  }
}
