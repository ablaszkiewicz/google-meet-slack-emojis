import { SLACK_CONFIG, STORAGE_KEYS } from "./config";
import { SlackAuthState } from "./types";

/**
 * Generate the Slack OAuth authorization URL
 */
export function getAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    // User scopes for identity
    user_scope: SLACK_CONFIG.USER_SCOPES.join(","),
    // Bot scopes for emoji access
    scope: SLACK_CONFIG.BOT_SCOPES.join(","),
  });

  return `${SLACK_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: SLACK_CONFIG.CLIENT_ID,
    client_secret: SLACK_CONFIG.CLIENT_SECRET,
    code: code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(SLACK_CONFIG.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  return response.json();
}

/**
 * Get user identity from Slack
 */
export async function getUserIdentity(accessToken: string) {
  const response = await fetch(SLACK_CONFIG.USER_INFO_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

/**
 * Emoji entry from Slack API
 */
export interface SlackEmoji {
  name: string;
  url: string;
  isAlias: boolean;
  aliasFor?: string;
}

/**
 * Get all custom emojis from the workspace
 */
export async function getWorkspaceEmojis(
  accessToken: string
): Promise<SlackEmoji[]> {
  const response = await fetch(SLACK_CONFIG.EMOJI_LIST_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to fetch emojis");
  }

  // Transform emoji object to array
  const emojis: SlackEmoji[] = [];

  for (const [name, value] of Object.entries(data.emoji || {})) {
    const url = value as string;

    // Check if it's an alias (starts with "alias:")
    if (url.startsWith("alias:")) {
      emojis.push({
        name,
        url: "", // Will resolve later
        isAlias: true,
        aliasFor: url.replace("alias:", ""),
      });
    } else {
      emojis.push({
        name,
        url,
        isAlias: false,
      });
    }
  }

  // Resolve aliases
  const emojiMap = new Map(
    emojis.filter((e) => !e.isAlias).map((e) => [e.name, e.url])
  );

  for (const emoji of emojis) {
    if (emoji.isAlias && emoji.aliasFor) {
      emoji.url = emojiMap.get(emoji.aliasFor) || "";
    }
  }

  // Filter out emojis without URLs and sort by name
  return emojis
    .filter((e) => e.url)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save auth state to chrome storage
 */
export async function saveAuthState(
  state: Partial<SlackAuthState>,
  botToken?: string
): Promise<void> {
  return new Promise((resolve) => {
    const data: Record<string, unknown> = {};

    if (state.accessToken !== undefined) {
      data[STORAGE_KEYS.SLACK_ACCESS_TOKEN] = state.accessToken;
    }
    if (botToken !== undefined) {
      data[STORAGE_KEYS.SLACK_BOT_TOKEN] = botToken;
    }
    if (state.user !== undefined) {
      data[STORAGE_KEYS.SLACK_USER] = state.user;
    }
    if (state.team !== undefined) {
      data[STORAGE_KEYS.SLACK_TEAM] = state.team;
    }

    chrome.storage.sync.set(data, resolve);
  });
}

/**
 * Get auth state from chrome storage
 */
export async function getAuthState(): Promise<SlackAuthState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [
        STORAGE_KEYS.SLACK_ACCESS_TOKEN,
        STORAGE_KEYS.SLACK_USER,
        STORAGE_KEYS.SLACK_TEAM,
      ],
      (items) => {
        resolve({
          isAuthenticated: !!items[STORAGE_KEYS.SLACK_ACCESS_TOKEN],
          accessToken: items[STORAGE_KEYS.SLACK_ACCESS_TOKEN] || null,
          user: items[STORAGE_KEYS.SLACK_USER] || null,
          team: items[STORAGE_KEYS.SLACK_TEAM] || null,
        });
      }
    );
  });
}

/**
 * Clear auth state from chrome storage
 */
export async function clearAuthState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(
      [
        STORAGE_KEYS.SLACK_ACCESS_TOKEN,
        STORAGE_KEYS.SLACK_BOT_TOKEN,
        STORAGE_KEYS.SLACK_USER,
        STORAGE_KEYS.SLACK_TEAM,
      ],
      resolve
    );
  });
}

/**
 * Get the bot token from storage (for emoji access)
 */
export async function getBotToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.SLACK_BOT_TOKEN], (items) => {
      resolve(items[STORAGE_KEYS.SLACK_BOT_TOKEN] || null);
    });
  });
}

/**
 * Start the OAuth login flow
 */
export async function startOAuthFlow(): Promise<SlackAuthState> {
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = getAuthUrl(redirectUri);

  console.log("[Auth] Redirect URI:", redirectUri);
  console.log("[Auth] Auth URL:", authUrl);

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      async (responseUrl) => {
        console.log("[Auth] Response URL:", responseUrl);

        if (chrome.runtime.lastError) {
          console.error("[Auth] Error:", chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!responseUrl) {
          reject(new Error("No response URL received"));
          return;
        }

        try {
          const url = new URL(responseUrl);
          const code = url.searchParams.get("code");

          if (!code) {
            const error = url.searchParams.get("error");
            reject(new Error(error || "No authorization code received"));
            return;
          }

          console.log("[Auth] Got code, exchanging for token...");

          // Exchange code for token
          const tokenResponse = await exchangeCodeForToken(code, redirectUri);
          console.log("[Auth] Token response:", tokenResponse);

          if (!tokenResponse.ok || !tokenResponse.authed_user?.access_token) {
            reject(
              new Error(tokenResponse.error || "Failed to get access token")
            );
            return;
          }

          const accessToken = tokenResponse.authed_user.access_token;
          // Bot token is at the top level of the response
          const botToken = tokenResponse.access_token;
          console.log("[Auth] Got bot token:", !!botToken);

          // Get user identity
          console.log("[Auth] Getting user identity...");
          const identityResponse = await getUserIdentity(accessToken);
          console.log("[Auth] Identity response:", identityResponse);

          if (!identityResponse.ok) {
            reject(
              new Error(identityResponse.error || "Failed to get user identity")
            );
            return;
          }

          const authState: SlackAuthState = {
            isAuthenticated: true,
            accessToken,
            user: identityResponse.user || null,
            team: identityResponse.team || null,
          };

          // Save to storage (including bot token)
          await saveAuthState(authState, botToken);
          console.log("[Auth] Auth state saved");

          resolve(authState);
        } catch (error) {
          console.error("[Auth] Error:", error);
          reject(error);
        }
      }
    );
  });
}
