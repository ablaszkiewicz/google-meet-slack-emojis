export interface SlackUser {
  id: string;
  name: string;
  email: string;
  image_24?: string;
  image_32?: string;
  image_48?: string;
  image_72?: string;
  image_192?: string;
  image_512?: string;
}

export interface SlackTeam {
  id: string;
  name: string;
  image_34?: string;
  image_44?: string;
  image_68?: string;
  image_88?: string;
  image_102?: string;
  image_132?: string;
  image_230?: string;
}

export interface SlackAuthState {
  isAuthenticated: boolean;
  user: SlackUser | null;
  team: SlackTeam | null;
  accessToken: string | null;
}

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  authed_user?: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  team?: {
    id: string;
    name: string;
  };
  error?: string;
}

export interface SlackIdentityResponse {
  ok: boolean;
  user?: SlackUser;
  team?: SlackTeam;
  error?: string;
}

// Message types for communication between popup and background script
export type SlackMessage =
  | { type: "SLACK_LOGIN" }
  | { type: "SLACK_LOGOUT" }
  | { type: "SLACK_GET_AUTH_STATE" }
  | { type: "SLACK_AUTH_SUCCESS"; payload: SlackAuthState }
  | { type: "SLACK_AUTH_ERROR"; payload: string }
  | { type: "SLACK_AUTH_STATE"; payload: SlackAuthState };
