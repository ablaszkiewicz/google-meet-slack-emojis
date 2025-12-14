import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
} from "@nestjs/common";
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { UserReadService } from '../read/user-read.service';
import { IUser } from './entities/user.interface';
import { UserWriteService } from "../write/user-write.service";
import { UpdateMeRequest } from "./dto/update-me.dto";

@Controller('users')
export class UserCoreController {
  constructor(
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService
  ) {}

  @Get('me')
  public async readCurrentUser(@CurrentUserId() userId): Promise<IUser> {
    const user = await this.userReadService.readById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Patch("me")
  public async updateCurrentUser(
    @CurrentUserId() userId: string,
    @Body() payload: UpdateMeRequest
  ): Promise<IUser> {
    const name = (payload.name ?? "").trim();
    if (!name) {
      throw new BadRequestException();
    }
    const updated = await this.userWriteService.updateName(userId, name);
    if (!updated) {
      throw new NotFoundException();
    }
    return updated;
  }
}
