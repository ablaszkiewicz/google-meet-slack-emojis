import {
  startOAuthFlow,
  getAuthState,
  clearAuthState,
  getEmojis,
} from "./slack/auth";
import { SlackMessage } from "./slack/types";

console.log("[Background] Service worker starting...");

chrome.runtime.onMessage.addListener(
  (
    message: SlackMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: SlackMessage) => void
  ) => {
    console.log("[Background] Received message:", message);

    switch (message.type) {
      case "SLACK_LOGIN":
        handleLogin(sendResponse);
        return true;

      case "SLACK_LOGOUT":
        handleLogout(sendResponse);
        return true;

      case "SLACK_GET_AUTH_STATE":
        handleGetAuthState(sendResponse);
        return true;

      case "SLACK_GET_EMOJIS":
        handleGetEmojis(sendResponse);
        return true;

      default:
        return false;
    }
  }
);

async function handleLogin(sendResponse: (response: SlackMessage) => void) {
  try {
    console.log("[Background] Starting OAuth flow...");
    const authState = await startOAuthFlow();
    console.log("[Background] OAuth success:", authState);
    sendResponse({
      type: "SLACK_AUTH_SUCCESS",
      payload: authState,
    });
  } catch (error) {
    console.error("[Background] OAuth error:", error);
    sendResponse({
      type: "SLACK_AUTH_ERROR",
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleLogout(sendResponse: (response: SlackMessage) => void) {
  try {
    await clearAuthState();
    sendResponse({
      type: "SLACK_AUTH_STATE",
      payload: {
        isAuthenticated: false,
        token: null,
        user: null,
      },
    });
  } catch (error) {
    sendResponse({
      type: "SLACK_AUTH_ERROR",
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleGetAuthState(
  sendResponse: (response: SlackMessage) => void
) {
  try {
    const authState = await getAuthState();
    sendResponse({
      type: "SLACK_AUTH_STATE",
      payload: authState,
    });
  } catch (error) {
    sendResponse({
      type: "SLACK_AUTH_ERROR",
      payload:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function handleGetEmojis(sendResponse: (response: SlackMessage) => void) {
  try {
    console.log("[Background] Fetching emojis...");
    const emojiList = await getEmojis();
    console.log(`[Background] Fetched ${emojiList.length} emojis`);

    sendResponse({
      type: "SLACK_EMOJIS_SUCCESS",
      payload: emojiList,
    });
  } catch (error) {
    console.error("[Background] Error fetching emojis:", error);
    sendResponse({
      type: "SLACK_EMOJIS_ERROR",
      payload:
        error instanceof Error ? error.message : "Failed to fetch emojis",
    });
  }
}

console.log("[Background] Message listener registered");
