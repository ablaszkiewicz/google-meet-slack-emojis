export interface BackendUser {
  id: string;
  email?: string;
  authMethod: string;
  slackTeamName?: string;
  slackUserName?: string;
  slackUserAvatar?: string;
  slackTeamId?: string;
  slackUserId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: BackendUser | null;
}

export interface SlackEmoji {
  name: string;
  url: string;
  isAlias: boolean;
  aliasFor?: string;
}

export type SlackMessage =
  | { type: "SLACK_LOGIN" }
  | { type: "SLACK_LOGOUT" }
  | { type: "SLACK_GET_AUTH_STATE" }
  | { type: "SLACK_GET_EMOJIS" }
  | { type: "SLACK_AUTH_SUCCESS"; payload: AuthState }
  | { type: "SLACK_AUTH_ERROR"; payload: string }
  | { type: "SLACK_AUTH_STATE"; payload: AuthState }
  | { type: "SLACK_EMOJIS_SUCCESS"; payload: SlackEmoji[] }
  | { type: "SLACK_EMOJIS_ERROR"; payload: string };
