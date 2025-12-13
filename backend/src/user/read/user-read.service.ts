import { Injectable } from '@nestjs/common';
import { IUser } from '../core/entities/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from '../core/entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserReadService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) {}

  public async readById(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id).lean<UserEntity>().exec();

    if (!user) {
      throw new Error('User not found');
    }

    return UserEntity.mapToInterface(user);
  }

  public async readByEmail(email: string): Promise<IUser> {
    const user = await this.userModel
      .findOne({ email: email })
      .lean<UserEntity>()
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    return UserEntity.mapToInterface(user);
  }
}
