import type { AuthState } from "./slack/types";
import { STORAGE_KEYS } from "./slack/config";

export class Storage {
  public static async get<T = unknown>(
    keys: string[]
  ): Promise<Record<string, T | undefined>> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (items) => resolve(items as any));
    });
  }

  public static async getOne<T = unknown>(key: string): Promise<T | null> {
    const items = await this.get<T>([key]);
    return (items[key] as T) ?? null;
  }

  public static async set(values: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(values, resolve);
    });
  }

  public static async remove(keys: string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(keys, resolve);
    });
  }

  public static async getAuthState(): Promise<AuthState> {
    const items = await this.get([
      STORAGE_KEYS.BACKEND_JWT,
      STORAGE_KEYS.BACKEND_USER,
    ]);

    const token = (items[STORAGE_KEYS.BACKEND_JWT] as string) || null;
    const user =
      (items[STORAGE_KEYS.BACKEND_USER] as AuthState["user"]) || null;

    return {
      isAuthenticated: !!token,
      token,
      user,
    };
  }

  public static async setAuthState(state: AuthState): Promise<void> {
    return this.set({
      [STORAGE_KEYS.BACKEND_JWT]: state.token,
      [STORAGE_KEYS.BACKEND_USER]: state.user,
    });
  }

  public static async clearAuthState(): Promise<void> {
    return this.remove([STORAGE_KEYS.BACKEND_JWT, STORAGE_KEYS.BACKEND_USER]);
  }
}
