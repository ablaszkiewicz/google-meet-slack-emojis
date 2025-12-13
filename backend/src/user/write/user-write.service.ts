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
    const filter = {
      slackTeamId: dto.slackTeamId,
      slackUserId: dto.slackUserId,
    };

    const $set: Partial<UserEntity> = {
      authMethod: AuthMethod.Slack,
      slackUserId: dto.slackUserId,
      slackTeamId: dto.slackTeamId,
      slackBotToken: dto.slackBotToken,
      lastActivityDate: new Date(),
    };

    if (dto.email !== undefined) $set.email = dto.email;
    if (dto.slackTeamName !== undefined) $set.slackTeamName = dto.slackTeamName;
    if (dto.slackUserName !== undefined) $set.slackUserName = dto.slackUserName;
    if (dto.slackUserAvatar !== undefined)
      $set.slackUserAvatar = dto.slackUserAvatar;

    await this.userModel.updateOne(filter, { $set }, { upsert: true }).exec();

    const user = await this.userModel.findOne(filter).lean<UserEntity>().exec();

    if (!user) {
      throw new Error("User not found");
    }

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
