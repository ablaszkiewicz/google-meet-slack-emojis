import { BACKEND_CONFIG, SLACK_CONFIG, STORAGE_KEYS } from "./config";
import { AuthState, BackendUser, SlackEmoji } from "./types";

export function getAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    user_scope: SLACK_CONFIG.USER_SCOPES.join(","),
    scope: SLACK_CONFIG.BOT_SCOPES.join(","),
  });

  return `${SLACK_CONFIG.AUTH_URL}?${params.toString()}`;
}

export async function saveAuthState(state: AuthState): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        [STORAGE_KEYS.BACKEND_JWT]: state.token,
        [STORAGE_KEYS.BACKEND_USER]: state.user,
      },
      resolve
    );
  });
}

export async function getAuthState(): Promise<AuthState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.BACKEND_JWT, STORAGE_KEYS.BACKEND_USER],
      (items) => {
        const token = (items[STORAGE_KEYS.BACKEND_JWT] as string) || null;
        const user = (items[STORAGE_KEYS.BACKEND_USER] as BackendUser) || null;
        resolve({
          isAuthenticated: !!token,
          token,
          user,
        });
      }
    );
  });
}

export async function clearAuthState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(
      [STORAGE_KEYS.BACKEND_JWT, STORAGE_KEYS.BACKEND_USER],
      resolve
    );
  });
}

export async function getEmojis(): Promise<SlackEmoji[]> {
  const state = await getAuthState();

  if (!state.token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${BACKEND_CONFIG.BASE_URL}/slack/emojis`, {
    method: "GET",
    headers: { Authorization: `Bearer ${state.token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch emojis");
  }

  return response.json();
}

export async function startOAuthFlow(): Promise<AuthState> {
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = getAuthUrl(redirectUri);

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (responseUrl) => {
        if (chrome.runtime.lastError) {
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

          const exchangeResponse = await fetch(
            `${BACKEND_CONFIG.BASE_URL}/auth/slack/exchange-code`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, redirectUri }),
            }
          );

          if (!exchangeResponse.ok) {
            reject(new Error("Slack login failed"));
            return;
          }

          const data = (await exchangeResponse.json()) as { token: string };

          const meResponse = await fetch(
            `${BACKEND_CONFIG.BASE_URL}/users/me`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${data.token}` },
            }
          );

          if (!meResponse.ok) {
            reject(new Error("Failed to load user"));
            return;
          }

          const user = (await meResponse.json()) as BackendUser;

          const authState: AuthState = {
            isAuthenticated: true,
            token: data.token,
            user,
          };

          await saveAuthState(authState);
          resolve(authState);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
