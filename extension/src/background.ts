import { startOAuthFlow } from "./slack/auth";
import { Message, MessageType } from "./slack/types";
import { Storage } from "./storage";
import { BackendApiFacade } from "./api/backendApiFacade";

console.log("[Background] Service worker starting...");

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: Message) => void
  ) => {
    console.log("[Background] Received message:", message);

    switch (message.type) {
      case MessageType.SlackLogin:
        handleLogin(sendResponse);
        return true;

      case MessageType.Logout:
        handleLogout(sendResponse);
        return true;

      case MessageType.GetAuthState:
        handleGetAuthState(sendResponse);
        return true;

      case MessageType.GetEmojis:
        handleGetEmojis(sendResponse);
        return true;

      default:
        return false;
    }
  }
);

async function handleLogin(sendResponse: (response: Message) => void) {
  try {
    console.log("[Background] Starting OAuth flow...");
    const authState = await startOAuthFlow();
    console.log("[Background] OAuth success:", authState);
    sendResponse({
      type: MessageType.SlackAuthSuccess,
      payload: authState,
    });
  } catch (error) {
    console.error("[Background] OAuth error:", error);
    sendResponse({
      type: MessageType.SlackAuthError,
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleLogout(sendResponse: (response: Message) => void) {
  try {
    await Storage.clearAuthState();
    sendResponse({
      type: MessageType.AuthState,
      payload: {
        isAuthenticated: false,
        token: null,
        user: null,
      },
    });
  } catch (error) {
    sendResponse({
      type: MessageType.SlackAuthError,
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleGetAuthState(sendResponse: (response: Message) => void) {
  try {
    const authState = await Storage.getAuthState();
    sendResponse({
      type: MessageType.AuthState,
      payload: authState,
    });
  } catch (error) {
    sendResponse({
      type: MessageType.SlackAuthError,
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleGetEmojis(sendResponse: (response: Message) => void) {
  try {
    console.log("[Background] Fetching emojis...");
    const emojiList = await BackendApiFacade.getEmojis();
    console.log(`[Background] Fetched ${emojiList.length} emojis`);

    sendResponse({
      type: MessageType.EmojisSuccess,
      payload: emojiList,
    });
  } catch (error) {
    console.error("[Background] Error fetching emojis:", error);
    sendResponse({
      type: MessageType.EmojisError,
      payload:
        error instanceof Error ? error.message : "Failed to fetch emojis",
    });
  }
}

console.log("[Background] Message listener registered");
