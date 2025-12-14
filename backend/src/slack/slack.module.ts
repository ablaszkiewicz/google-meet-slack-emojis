import { Module } from '@nestjs/common';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';
import { UserReadModule } from '../user/read/user-read.module';
import { SlackRealtimeService } from './slack-realtime.service';

@Module({
  imports: [UserReadModule],
  controllers: [SlackController],
  providers: [SlackService, SlackRealtimeService],
})
export class SlackModule {}


