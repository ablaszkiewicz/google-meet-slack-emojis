import { Controller, Get } from '@nestjs/common';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { SlackEmojiDto } from './dto/slack-emoji.dto';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('emojis')
  public async listEmojis(@CurrentUserId() userId: string): Promise<SlackEmojiDto[]> {
    return this.slackService.listEmojis(userId);
  }
}


