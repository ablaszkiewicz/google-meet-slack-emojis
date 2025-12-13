import { BadRequestException, Injectable } from '@nestjs/common';
import { UserReadService } from '../user/read/user-read.service';
import { SlackEmojiDto } from './dto/slack-emoji.dto';

type SlackEmojiListResponse = {
  ok: boolean;
  emoji?: Record<string, string>;
  error?: string;
};

@Injectable()
export class SlackService {
  constructor(private readonly userReadService: UserReadService) {}

  public async listEmojis(userId: string): Promise<SlackEmojiDto[]> {
    const { slackBotToken } = await this.userReadService.readByIdWithSlackBotToken(
      userId,
    );

    const response = await fetch('https://slack.com/api/emoji.list', {
      method: 'GET',
      headers: { Authorization: `Bearer ${slackBotToken}` },
    });

    const data = (await response.json()) as SlackEmojiListResponse;

    if (!data.ok) {
      throw new BadRequestException(data.error ?? 'Failed to fetch emojis');
    }

    const emojis: SlackEmojiDto[] = [];

    for (const [name, value] of Object.entries(data.emoji ?? {})) {
      if (value.startsWith('alias:')) {
        emojis.push({
          name,
          url: '',
          isAlias: true,
          aliasFor: value.replace('alias:', ''),
        });
        continue;
      }

      emojis.push({ name, url: value, isAlias: false });
    }

    const emojiMap = new Map(
      emojis.filter((e) => !e.isAlias).map((e) => [e.name, e.url]),
    );

    for (const emoji of emojis) {
      if (emoji.isAlias && emoji.aliasFor) {
        emoji.url = emojiMap.get(emoji.aliasFor) ?? '';
      }
    }

    return emojis
      .filter((e) => e.url)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}


