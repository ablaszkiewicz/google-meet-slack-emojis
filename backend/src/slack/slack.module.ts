import { Module } from '@nestjs/common';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';
import { UserReadModule } from '../user/read/user-read.module';

@Module({
  imports: [UserReadModule],
  controllers: [SlackController],
  providers: [SlackService],
})
export class SlackModule {}


