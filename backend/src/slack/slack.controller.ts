import { Controller, Get } from "@nestjs/common";
import { CurrentUserEmail } from "../auth/core/decorators/current-user-email.decorator";
import { SlackEmojiDto } from "./dto/slack-emoji.dto";
import { SlackService } from "./slack.service";

@Controller("slack")
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get("emojis")
  public async listEmojis(
    @CurrentUserEmail() email: string
  ): Promise<SlackEmojiDto[]> {
    return this.slackService.listEmojis(email);
  }
}
