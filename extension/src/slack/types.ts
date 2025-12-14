import type { BackendUserDto, SlackEmojiDto } from "../api/backendApiFacade";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: BackendUserDto | null;
}

export enum MessageType {
  SlackLogin = "slack-login",
  SlackAuthSuccess = "slack-auth-success",
  SlackAuthError = "slack-auth-error",
  Logout = "logout",
  GetAuthState = "get-auth-state",
  AuthState = "auth-state",
  GetEmojis = "get-emojis",
  EmojisSuccess = "emojis-success",
  EmojisError = "emojis-error",
  SubscribeMeetingEvents = "subscribe-meeting-events",
  UnsubscribeMeetingEvents = "unsubscribe-meeting-events",
  PostMeetingReaction = "post-meeting-reaction",
  DeleteMeetingReaction = "delete-meeting-reaction",
  MeetingReactionEvent = "meeting-reaction-event",
}

export type Message =
  | { type: MessageType.SlackLogin }
  | { type: MessageType.Logout }
  | { type: MessageType.GetAuthState }
  | { type: MessageType.GetEmojis }
  | { type: MessageType.SlackAuthSuccess; payload: AuthState }
  | { type: MessageType.SlackAuthError; payload: string }
  | { type: MessageType.AuthState; payload: AuthState }
  | { type: MessageType.EmojisSuccess; payload: SlackEmojiDto[] }
  | { type: MessageType.EmojisError; payload: string }
  | { type: MessageType.SubscribeMeetingEvents; payload: { meetingId: string } }
  | {
      type: MessageType.UnsubscribeMeetingEvents;
      payload: { meetingId: string };
    }
  | {
      type: MessageType.PostMeetingReaction;
      payload: {
        meetingId: string;
        messageId: string;
        emojiName: string;
        emojiUrl: string;
      };
    }
  | {
      type: MessageType.DeleteMeetingReaction;
      payload: {
        meetingId: string;
        messageId: string;
        emojiName: string;
        emojiUrl: string;
      };
    }
  | {
      type: MessageType.MeetingReactionEvent;
      payload: {
        action: "add" | "remove";
        meetingId: string;
        messageId: string;
        emojiName: string;
        emojiUrl: string;
        user: { id: string; name?: string };
      };
    };
