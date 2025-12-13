import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity } from '../core/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from '../core/entities/user.interface';

@Injectable()
export class UserWriteService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
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

  public async updateLastActivityDate(
    userId: string,
    date: Date,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { lastActivityDate: date },
    );
  }
}
