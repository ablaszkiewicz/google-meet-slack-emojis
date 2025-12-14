import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Sse,
} from "@nestjs/common";
import { CurrentUserEmail } from "../auth/core/decorators/current-user-email.decorator";
import { CurrentUserId } from "../auth/core/decorators/current-user-id.decorator";
import { SlackEmojiDto } from "./dto/slack-emoji.dto";
import { SlackService } from "./slack.service";
import { SlackRealtimeService } from "./slack-realtime.service";
import { map, Observable } from "rxjs";
import {
  DeleteMeetingReactionRequest,
  MeetingReactionEvent,
  PostMeetingReactionRequest,
} from "./dto/meeting-reaction.dto";
import { UserReadService } from "../user/read/user-read.service";

@Controller("slack")
export class SlackController {
  private readonly logger = new Logger(SlackController.name);
  constructor(
    private readonly slackService: SlackService,
    private readonly realtime: SlackRealtimeService,
    private readonly userReadService: UserReadService
  ) {}

  @Get("emojis")
  public async listEmojis(
    @CurrentUserEmail() email: string
  ): Promise<SlackEmojiDto[]> {
    return this.slackService.listEmojis(email);
  }

  @Sse("meetings/:meetingId/events")
  public meetingEvents(
    @Param("meetingId") meetingId: string
  ): Observable<{ data: MeetingReactionEvent }> {
    this.logger.log(`SSE subscribe meetingId=${meetingId}`);
    return this.realtime.stream(meetingId).pipe(map((data) => ({ data })));
  }

  @Post("meetings/:meetingId/reactions")
  public async postReaction(
    @Param("meetingId") meetingId: string,
    @CurrentUserId() userId: string,
    @Body() payload: PostMeetingReactionRequest
  ): Promise<void> {
    this.logger.log(
      `POST reaction meetingId=${meetingId} userId=${userId} messageId=${payload.messageId} emoji=${payload.emojiName}`
    );
    const user = await this.userReadService.readById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    const event: MeetingReactionEvent = {
      action: "add",
      meetingId,
      messageId: payload.messageId,
      emojiName: payload.emojiName,
      emojiUrl: payload.emojiUrl,
      user,
    };

    this.realtime.emit(meetingId, event);
  }

  @Delete("meetings/:meetingId/reactions")
  public async deleteReaction(
    @Param("meetingId") meetingId: string,
    @CurrentUserId() userId: string,
    @Body() payload: DeleteMeetingReactionRequest
  ): Promise<void> {
    this.logger.log(
      `DELETE reaction meetingId=${meetingId} userId=${userId} messageId=${payload.messageId} emoji=${payload.emojiName}`
    );
    const user = await this.userReadService.readById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    const event: MeetingReactionEvent = {
      action: "remove",
      meetingId,
      messageId: payload.messageId,
      emojiName: payload.emojiName,
      emojiUrl: payload.emojiUrl,
      user,
    };

    this.realtime.emit(meetingId, event);
  }
}
