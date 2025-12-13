import { Controller, Get } from '@nestjs/common';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { UserReadService } from '../read/user-read.service';
import { IUser } from './entities/user.interface';

@Controller('users')
export class UserCoreController {
  constructor(private readonly userReadService: UserReadService) {}

  @Get('me')
  public async readCurrentUser(@CurrentUserId() userId): Promise<IUser> {
    const user = await this.userReadService.readById(userId);

    return user;
  }
}
