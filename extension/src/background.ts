import { startOAuthFlow } from "./slack/auth";
import { Message, MessageType } from "./slack/types";
import { Storage } from "./storage";
import { BackendApiFacade } from "./api/backendApiFacade";
import { BACKEND_CONFIG } from "./slack/config";

console.log("[Background] Service worker starting...");

type MeetingStreamState = {
  meetingId: string;
  tabIds: Set<number>;
  abort: AbortController;
  running: boolean;
  reconnectAttempt: number;
};

const meetingStreams = new Map<string, MeetingStreamState>();

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
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

      case MessageType.SubscribeMeetingEvents:
        handleSubscribeMeetingEvents(message, sender, sendResponse);
        return true;

      case MessageType.UnsubscribeMeetingEvents:
        handleUnsubscribeMeetingEvents(message, sender, sendResponse);
        return true;

      case MessageType.PostMeetingReaction:
        handlePostMeetingReaction(message, sender, sendResponse);
        return true;

      case MessageType.DeleteMeetingReaction:
        handleDeleteMeetingReaction(message, sender, sendResponse);
        return true;

      default:
        return false;
    }
  }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const [meetingId, state] of meetingStreams.entries()) {
    if (!state.tabIds.has(tabId)) continue;
    state.tabIds.delete(tabId);
    console.log("[Background] Tab removed from meeting stream", {
      meetingId,
      tabId,
      remaining: state.tabIds.size,
    });
    if (state.tabIds.size === 0) {
      state.abort.abort();
      meetingStreams.delete(meetingId);
      console.log("[Background] Meeting stream stopped (no tabs)", { meetingId });
    }
  }
});

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

async function handleSubscribeMeetingEvents(
  message: Extract<Message, { type: MessageType.SubscribeMeetingEvents }>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Message) => void
) {
  const meetingId = message.payload.meetingId;
  const tabId = sender.tab?.id;
  sendResponse({
    type: MessageType.AuthState,
    payload: await Storage.getAuthState(),
  });

  if (typeof tabId !== "number") {
    return;
  }

  const existing = meetingStreams.get(meetingId);
  if (existing) {
    existing.tabIds.add(tabId);
    console.log("[Background] Added tab to meeting stream", {
      meetingId,
      tabId,
      tabs: existing.tabIds.size,
    });
    return;
  }

  const abort = new AbortController();
  const state: MeetingStreamState = {
    meetingId,
    tabIds: new Set([tabId]),
    abort,
    running: false,
    reconnectAttempt: 0,
  };
  meetingStreams.set(meetingId, state);
  console.log("[Background] Starting meeting stream", { meetingId, tabId });
  startMeetingStream(state).catch((e) => {
    console.log("[Background] Meeting stream ended", { meetingId, error: String(e) });
  });
}

async function handleUnsubscribeMeetingEvents(
  message: Extract<Message, { type: MessageType.UnsubscribeMeetingEvents }>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Message) => void
) {
  const meetingId = message.payload.meetingId;
  const tabId = sender.tab?.id;
  sendResponse({
    type: MessageType.AuthState,
    payload: await Storage.getAuthState(),
  });

  const state = meetingStreams.get(meetingId);
  if (!state || typeof tabId !== "number") return;

  state.tabIds.delete(tabId);
  console.log("[Background] Removed tab from meeting stream", {
    meetingId,
    tabId,
    remaining: state.tabIds.size,
  });
  if (state.tabIds.size === 0) {
    state.abort.abort();
    meetingStreams.delete(meetingId);
    console.log("[Background] Meeting stream stopped", { meetingId });
  }
}

async function handlePostMeetingReaction(
  message: Extract<Message, { type: MessageType.PostMeetingReaction }>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Message) => void
) {
  void sender;
  const state = await Storage.getAuthState();
  if (!state.token) {
    sendResponse({ type: MessageType.EmojisError, payload: "Not authenticated" });
    return;
  }
  const { meetingId, messageId, emojiName, emojiUrl } = message.payload;
  const url = `${BACKEND_CONFIG.BASE_URL}/slack/meetings/${meetingId}/reactions`;
  console.log("[Background] POST reaction", { meetingId, messageId, emojiName });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageId, emojiName, emojiUrl }),
  });
  console.log("[Background] POST reaction response", {
    ok: response.ok,
    status: response.status,
  });
  sendResponse({ type: MessageType.AuthState, payload: state });
}

async function handleDeleteMeetingReaction(
  message: Extract<Message, { type: MessageType.DeleteMeetingReaction }>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Message) => void
) {
  void sender;
  const state = await Storage.getAuthState();
  if (!state.token) {
    sendResponse({ type: MessageType.EmojisError, payload: "Not authenticated" });
    return;
  }
  const { meetingId, messageId, emojiName, emojiUrl } = message.payload;
  const url = `${BACKEND_CONFIG.BASE_URL}/slack/meetings/${meetingId}/reactions`;
  console.log("[Background] DELETE reaction", { meetingId, messageId, emojiName });
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageId, emojiName, emojiUrl }),
  });
  console.log("[Background] DELETE reaction response", {
    ok: response.ok,
    status: response.status,
  });
  sendResponse({ type: MessageType.AuthState, payload: state });
}

async function startMeetingStream(state: MeetingStreamState): Promise<void> {
  if (state.running) return;
  state.running = true;
  const auth = await Storage.getAuthState();
  if (!auth.token) {
    state.running = false;
    return;
  }

  const url = `${BACKEND_CONFIG.BASE_URL}/slack/meetings/${state.meetingId}/events`;
  console.log("[Background] SSE connect", {
    meetingId: state.meetingId,
    reconnectAttempt: state.reconnectAttempt,
  });
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.token}` },
    signal: state.abort.signal,
  });
  if (!response.ok || !response.body) {
    console.log("[Background] SSE connect failed", {
      meetingId: state.meetingId,
      status: response.status,
    });
    state.running = false;
    scheduleReconnect(state);
    return;
  }

  console.log("[Background] SSE connected", { meetingId: state.meetingId });
  state.reconnectAttempt = 0;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = chunk.split("\n");
        const dataLines = lines
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());
        if (dataLines.length === 0) continue;
        const dataStr = dataLines.join("\n");
        try {
          const event = JSON.parse(dataStr) as {
            action: "add" | "remove";
            meetingId: string;
            messageId: string;
            emojiName: string;
            emojiUrl: string;
            user: { id: string; name?: string };
          };
          console.log("[Background] SSE event", {
            meetingId: event.meetingId,
            messageId: event.messageId,
            emojiName: event.emojiName,
            action: event.action,
            userId: event.user?.id,
          });
          for (const tabId of Array.from(state.tabIds.values())) {
            chrome.tabs.sendMessage(tabId, {
              type: MessageType.MeetingReactionEvent,
              payload: event,
            } as Message);
          }
        } catch (e) {
          continue;
        }
      }
    }
  } catch (e) {
    console.log("[Background] SSE read error", { meetingId: state.meetingId });
  }

  state.running = false;
  console.log("[Background] SSE disconnected", { meetingId: state.meetingId });
  scheduleReconnect(state);
}

function scheduleReconnect(state: MeetingStreamState) {
  if (state.abort.signal.aborted) return;
  if (state.tabIds.size === 0) return;
  const attempt = Math.min(8, state.reconnectAttempt + 1);
  state.reconnectAttempt = attempt;
  const delayMs = Math.min(30000, 750 * Math.pow(2, attempt));
  console.log("[Background] SSE reconnect scheduled", {
    meetingId: state.meetingId,
    attempt,
    delayMs,
  });
  setTimeout(() => {
    const current = meetingStreams.get(state.meetingId);
    if (!current) return;
    if (current.abort.signal.aborted) return;
    if (current.tabIds.size === 0) return;
    startMeetingStream(current).catch(() => undefined);
  }, delayMs);
}

console.log("[Background] Message listener registered");
