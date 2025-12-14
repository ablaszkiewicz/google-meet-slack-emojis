import { IUser } from "../../user/core/entities/user.interface";

export class PostMeetingReactionRequest {
  messageId: string;
  emojiName: string;
  emojiUrl: string;
}

export class MeetingReactionEvent {
  meetingId: string;
  messageId: string;
  emojiName: string;
  emojiUrl: string;
  user: IUser;
}


