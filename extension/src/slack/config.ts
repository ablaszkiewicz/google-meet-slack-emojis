export const SLACK_CONFIG = {
  CLIENT_ID: "910200304849.10006039762304",
  USER_SCOPES: [
    "identity.basic",
    "identity.email",
    "identity.avatar",
    "identity.team",
  ],
  BOT_SCOPES: ["emoji:read"],
  AUTH_URL: "https://slack.com/oauth/v2/authorize",
};

export const BACKEND_CONFIG = {
  BASE_URL: "http://localhost:3000",
};

export const STORAGE_KEYS = {
  BACKEND_JWT: "backend_jwt",
  BACKEND_USER: "backend_user",
};
