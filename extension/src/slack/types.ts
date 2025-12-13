import type { BackendUserDto, SlackEmojiDto } from "../api/backendApiFacade";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: BackendUserDto | null;
}

export type Message =
  | { type: "SLACK_LOGIN" }
  | { type: "SLACK_LOGOUT" }
  | { type: "SLACK_GET_AUTH_STATE" }
  | { type: "SLACK_GET_EMOJIS" }
  | { type: "SLACK_AUTH_SUCCESS"; payload: AuthState }
  | { type: "SLACK_AUTH_ERROR"; payload: string }
  | { type: "SLACK_AUTH_STATE"; payload: AuthState }
  | { type: "SLACK_EMOJIS_SUCCESS"; payload: SlackEmojiDto[] }
  | { type: "SLACK_EMOJIS_ERROR"; payload: string };
