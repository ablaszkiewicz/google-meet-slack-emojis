// Slack OAuth Configuration
export const SLACK_CONFIG = {
  CLIENT_ID: "910200304849.10006039762304",
  // Note: In production, the client secret should be handled server-side
  // For development/demo purposes, we're using it here
  CLIENT_SECRET: "ceec54fe0aa94a18348fa55594f10391",
  // User scopes for "Sign in with Slack" (identity)
  USER_SCOPES: [
    "identity.basic",
    "identity.email",
    "identity.avatar",
    "identity.team",
  ],
  // Bot scopes for app functionality
  BOT_SCOPES: ["emoji:read"],
  EMOJI_LIST_URL: "https://slack.com/api/emoji.list",
  AUTH_URL: "https://slack.com/oauth/v2/authorize",
  TOKEN_URL: "https://slack.com/api/oauth.v2.access",
  USER_INFO_URL: "https://slack.com/api/users.identity",
};

export const STORAGE_KEYS = {
  SLACK_ACCESS_TOKEN: "slack_access_token",
  SLACK_BOT_TOKEN: "slack_bot_token",
  SLACK_USER: "slack_user",
  SLACK_TEAM: "slack_team",
};
