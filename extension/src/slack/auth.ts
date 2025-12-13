import { SLACK_CONFIG } from "./config";
import { BackendApiFacade } from "../api/backendApiFacade";
import { Storage } from "../storage";
import { AuthState } from "./types";

export function getAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    user_scope: SLACK_CONFIG.USER_SCOPES.join(","),
    scope: SLACK_CONFIG.BOT_SCOPES.join(","),
  });

  return `${SLACK_CONFIG.AUTH_URL}?${params.toString()}`;
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

          const data = await BackendApiFacade.exchangeSlackCode({
            code,
            redirectUri,
          });
          const user = await BackendApiFacade.getCurrentUser(data.token);

          const authState: AuthState = {
            isAuthenticated: true,
            token: data.token,
            user,
          };

          await Storage.setAuthState(authState);
          resolve(authState);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
