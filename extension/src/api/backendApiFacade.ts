import { BACKEND_CONFIG } from "../slack/config";
import { Storage } from "../storage";

export type ExchangeSlackCodeRequest = {
  code: string;
  redirectUri: string;
};

export type ExchangeSlackCodeResponse = {
  token: string;
};

export type BackendUserDto = {
  id: string;
  email?: string;
  slackTeamName?: string;
  name?: string;
  avatar?: string;
  slackTeamId?: string;
  slackUserId?: string;
};

export type SlackEmojiDto = {
  name: string;
  url: string;
  isAlias: boolean;
  aliasFor?: string;
};

export class BackendApiFacade {
  private static baseUrl(): string {
    return BACKEND_CONFIG.BASE_URL;
  }

  private static async requireToken(): Promise<string> {
    const state = await Storage.getAuthState();
    if (!state.token) {
      throw new Error("Not authenticated");
    }
    return state.token;
  }

  public static async exchangeSlackCode(
    payload: ExchangeSlackCodeRequest
  ): Promise<ExchangeSlackCodeResponse> {
    return this.requestJson<ExchangeSlackCodeResponse>(
      "/auth/slack/exchange-code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  }

  public static async getCurrentUser(token?: string): Promise<BackendUserDto> {
    const authToken = token ?? (await this.requireToken());
    return this.requestJson<BackendUserDto>("/users/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }

  public static async getEmojis(token?: string): Promise<SlackEmojiDto[]> {
    const authToken = token ?? (await this.requireToken());
    return this.requestJson<SlackEmojiDto[]>("/slack/emojis", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }

  private static async requestJson<T>(
    path: string,
    init: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl()}${path}`, init);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Request failed");
    }

    return response.json();
  }
}
