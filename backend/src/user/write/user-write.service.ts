import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserEntity } from "../core/entities/user.entity";
import { IUser } from "../core/entities/user.interface";
import { UpsertUserDto } from "./dto/upsert-slack-user.dto";

@Injectable()
export class UserWriteService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>
  ) {}

  public async upsertUser(dto: UpsertUserDto): Promise<IUser> {
    const filter = {
      email: dto.email,
    };

    const $set: Partial<UserEntity> = {
      email: dto.email,
      slackUserId: dto.slackUserId,
      slackTeamId: dto.slackTeamId,
      slackBotToken: dto.slackBotToken,
    };

    if (dto.slackTeamName !== undefined) $set.slackTeamName = dto.slackTeamName;
    if (dto.name !== undefined) $set.name = dto.name;
    if (dto.avatar !== undefined) $set.avatar = dto.avatar;

    const existing = await this.userModel
      .findOne(filter)
      .lean<UserEntity>()
      .exec();

    if (existing) {
      await this.userModel.updateOne({ _id: existing._id }, { $set }).exec();
    } else {
      await this.userModel.create({ ...filter, ...$set });
    }

    const user = await this.userModel.findOne(filter).lean<UserEntity>().exec();

    if (!user) {
      throw new Error("User not found");
    }

    return UserEntity.mapToInterface(user);
  }
}
