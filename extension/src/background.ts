import { startOAuthFlow, getAuthState, clearAuthState } from "./slack/auth";

console.log("[Background] Service worker starting...");

// Define message types inline
type SlackAuthPayload = {
  isAuthenticated: boolean;
  user: unknown;
  team: unknown;
  accessToken: string | null;
};

type SlackMessage =
  | { type: "SLACK_LOGIN" }
  | { type: "SLACK_LOGOUT" }
  | { type: "SLACK_GET_AUTH_STATE" }
  | { type: "SLACK_AUTH_SUCCESS"; payload: SlackAuthPayload }
  | { type: "SLACK_AUTH_ERROR"; payload: string }
  | { type: "SLACK_AUTH_STATE"; payload: SlackAuthPayload };

// Handle messages from popup
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
        return true; // Keep the message channel open for async response

      case "SLACK_LOGOUT":
        handleLogout(sendResponse);
        return true;

      case "SLACK_GET_AUTH_STATE":
        handleGetAuthState(sendResponse);
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
        user: null,
        team: null,
        accessToken: null,
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

console.log("[Background] Message listener registered");
