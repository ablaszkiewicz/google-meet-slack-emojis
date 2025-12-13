import { Module } from '@nestjs/common';
import { UserCoreController } from './user-core.controller';
import { UserReadModule } from '../read/user-read.module';
import { UserCoreEventController } from './user-core.event-controller';
import { UserWriteModule } from '../write/user-write.module';

@Module({
  imports: [UserReadModule, UserWriteModule],
  providers: [UserCoreEventController],
  controllers: [UserCoreController],
})
export class UserCoreModule {}
