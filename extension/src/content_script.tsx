import { Message, MessageType } from "./slack/types";
console.log("[MeetEmoji] Content script loaded on Google Meet");

interface SlackEmoji {
  name: string;
  url: string;
}

let emojis: SlackEmoji[] = [];
let currentPickerMessageId: string | null = null;
let pickerElement: HTMLElement | null = null;
let reactionTooltipEl: HTMLElement | null = null;
let reactionTooltipTimer: number | null = null;
let reactionTooltipAnchor: HTMLElement | null = null;
let meetingId: string | null = null;
let currentUserId: string | null = null;
let meetingResubscribeTimer: number | null = null;

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .meet-emoji-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .meet-emoji-add-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 14px;
      border: 1px dashed rgba(250, 250, 250, 0.22);
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      color: rgba(250, 250, 250, 0.8);
      font-size: 12px;
      font-family: inherit;
    }

    .meet-emoji-add-btn:hover {
      background: rgba(250, 250, 250, 0.08) !important;
      border-color: rgba(250, 250, 250, 0.28) !important;
      color: #fafafa !important;
    }

    .meet-emoji-add-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .meet-emoji-picker {
      position: fixed;
      width: 320px;
      max-height: 400px;
      background: #141619;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(250, 250, 250, 0.12);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .meet-emoji-picker-header {
      padding: 12px 16px;
      background: #232529;
      border-bottom: 1px solid rgba(250, 250, 250, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .meet-emoji-picker-title {
      color: #fafafa;
      font-size: 14px;
      font-weight: 600;
    }

    .meet-emoji-picker-close {
      width: 24px;
      height: 24px;
      border: none;
      background: #1b1d21;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(250, 250, 250, 0.7);
      font-size: 16px;
      line-height: 1;
    }

    .meet-emoji-picker-close:hover {
      background: rgba(250, 250, 250, 0.08);
      color: #fafafa;
    }

    .meet-emoji-picker-search {
      margin: 12px;
      padding: 10px 14px;
      background: #1b1d21;
      border: 1px solid rgba(250, 250, 250, 0.12);
      border-radius: 8px;
      color: #fafafa;
      font-size: 13px;
      outline: none;
      width: calc(100% - 24px);
      box-sizing: border-box;
    }

    .meet-emoji-picker-search::placeholder {
      color: rgba(250, 250, 250, 0.45);
    }

    .meet-emoji-picker-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      padding: 8px 12px;
      overflow-y: auto;
      flex: 1;
      max-height: 280px;
      background: #1b1d21;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar {
      width: 6px;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar-track {
      background: #141619;
      border-radius: 3px;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar-thumb {
      background: rgba(250, 250, 250, 0.2);
      border-radius: 3px;
    }

    .meet-emoji-picker-item {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      border: 1px solid transparent;
      padding: 6px;
      transition: all 0.15s ease;
    }

    .meet-emoji-picker-item:hover {
      background: #232529;
      border: 1px solid rgba(250, 250, 250, 0.18);
    }

    .meet-emoji-picker-item img {
      width: 100%;
      height: 100%;
      max-width: 28px;
      max-height: 28px;
      object-fit: contain;
    }

    .meet-emoji-picker-empty {
      padding: 24px;
      text-align: center;
      color: rgba(250, 250, 250, 0.6);
      font-size: 13px;
    }

    .meet-emoji-picker-loading {
      padding: 24px;
      text-align: center;
      color: rgba(250, 250, 250, 0.6);
      font-size: 13px;
    }

    .meet-emoji-reaction {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 12px 2px 6px;
      background: rgba(250, 250, 250, 0.08);
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      appearance: none;
      outline: none;
      color: inherit;
    }

    .meet-emoji-reaction:hover {
      background: rgba(250, 250, 250, 0.12);
      border-color: rgba(250, 250, 250, 0.18);
    }

    .meet-emoji-reaction--mine {
      background: rgba(250, 250, 250, 0.16);
      border-color: rgba(250, 250, 250, 0.42);
      border-width: 2px;
    }

    .meet-emoji-reaction--mine:hover {
      background: rgba(250, 250, 250, 0.2);
      border-color: rgba(250, 250, 250, 0.55);
    }

    .meet-emoji-reaction img {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    .meet-emoji-reaction-count {
      font-size: 11px;
      color: rgba(250, 250, 250, 0.85);
      font-weight: 500;
    }

    .meet-emoji-tooltip {
      position: fixed;
      z-index: 1000000;
      background: #232529;
      border: 1px solid rgba(250, 250, 250, 0.12);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
      padding: 10px 12px;
      color: #fafafa;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      transform: translate(-50%, -100%);
      opacity: 0;
      transition: opacity 0.12s ease;
    }

    .meet-emoji-tooltip[data-open="true"] {
      opacity: 1;
    }

    .meet-emoji-tooltip-emoji {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1b1d21;
      border: 1px solid rgba(250, 250, 250, 0.12);
      border-radius: 10px;
    }

    .meet-emoji-tooltip-emoji img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .meet-emoji-tooltip-text {
      font-size: 12px;
      color: rgba(250, 250, 250, 0.8);
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}

function ensureReactionTooltip(): HTMLElement {
  if (reactionTooltipEl) return reactionTooltipEl;
  const el = document.createElement("div");
  el.className = "meet-emoji-tooltip";
  el.setAttribute("data-open", "false");
  document.body.appendChild(el);
  reactionTooltipEl = el;
  return el;
}

function hideReactionTooltip() {
  if (reactionTooltipTimer !== null) {
    window.clearTimeout(reactionTooltipTimer);
    reactionTooltipTimer = null;
  }
  reactionTooltipAnchor = null;
  if (reactionTooltipEl) {
    reactionTooltipEl.setAttribute("data-open", "false");
  }
}

function showReactionTooltip(anchor: HTMLElement, name: string, url: string) {
  const el = ensureReactionTooltip();
  el.innerHTML = `
    <div class="meet-emoji-tooltip-emoji">
      <img src="${url}" alt="${name}" />
    </div>
    <div class="meet-emoji-tooltip-text">You reacted with :${name}:</div>
  `;

  const rect = anchor.getBoundingClientRect();
  const left = rect.left + rect.width / 2;
  const top = rect.top - 10;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.setAttribute("data-open", "true");
}

function scheduleReactionTooltip(
  anchor: HTMLElement,
  name: string,
  url: string
) {
  hideReactionTooltip();
  reactionTooltipAnchor = anchor;
  reactionTooltipTimer = window.setTimeout(() => {
    if (reactionTooltipAnchor !== anchor) return;
    showReactionTooltip(anchor, name, url);
  }, 500);
}

async function loadEmojis(): Promise<void> {
  return new Promise((resolve) => {
    console.log("[MeetEmoji] Requesting emojis from background script...");

    chrome.runtime.sendMessage({ type: MessageType.GetEmojis }, (response) => {
      console.log("[MeetEmoji] Got response from background:", response);

      if (chrome.runtime.lastError) {
        console.error("[MeetEmoji] Error:", chrome.runtime.lastError.message);
        resolve();
        return;
      }

      if (!response) {
        console.error("[MeetEmoji] No response from background script");
        resolve();
        return;
      }

      if (response.type === MessageType.EmojisSuccess) {
        emojis = response.payload;
        console.log(`[MeetEmoji] Loaded ${emojis.length} emojis`);
      } else if (response.type === MessageType.EmojisError) {
        console.error("[MeetEmoji] Error:", response.payload);
      }

      resolve();
    });
  });
}

function getMeetingIdFromUrl(): string | null {
  const path = window.location.pathname.replace("/", "").trim();
  if (!path) return null;
  if (path.includes("/")) return null;
  return path;
}

function subscribeMeetingEvents(meetingId: string) {
  chrome.runtime.sendMessage(
    { type: MessageType.SubscribeMeetingEvents, payload: { meetingId } },
    () => undefined
  );
}

function postReaction(input: {
  meetingId: string;
  messageId: string;
  emojiName: string;
  emojiUrl: string;
}) {
  chrome.runtime.sendMessage(
    { type: MessageType.PostMeetingReaction, payload: input },
    () => undefined
  );
}

function deleteReaction(input: {
  meetingId: string;
  messageId: string;
  emojiName: string;
  emojiUrl: string;
}) {
  chrome.runtime.sendMessage(
    { type: MessageType.DeleteMeetingReaction, payload: input },
    () => undefined
  );
}

function refreshCurrentUserId() {
  chrome.runtime.sendMessage({ type: MessageType.GetAuthState }, (response) => {
    if (!response) return;
    if (response.type !== MessageType.AuthState) return;
    currentUserId = response.payload.user?.id ?? null;
  });
}

function createReactionButtonSvg(): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.79 0 1.5-.71 1.5-1.5S8.79 9 8 9s-1.5.71-1.5 1.5S7.21 12 8 12zm8 0c.79 0 1.5-.71 1.5-1.5S16.79 9 16 9s-1.5.71-1.5 1.5.71 1.5 1.5 1.5zm-4 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>`;
}

function createEmojiPicker(): HTMLElement {
  const picker = document.createElement("div");
  picker.className = "meet-emoji-picker";
  picker.innerHTML = `
    <div class="meet-emoji-picker-header">
      <span class="meet-emoji-picker-title">Add Reaction</span>
      <button class="meet-emoji-picker-close">×</button>
    </div>
    <input type="text" class="meet-emoji-picker-search" placeholder="Search emojis..." />
    <div class="meet-emoji-picker-grid"></div>
  `;

  picker
    .querySelector(".meet-emoji-picker-close")
    ?.addEventListener("click", () => {
      closePicker();
    });

  const searchInput = picker.querySelector(
    ".meet-emoji-picker-search"
  ) as HTMLInputElement;
  searchInput?.addEventListener("input", () => {
    renderEmojisInPicker(picker, searchInput.value);
  });

  picker.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return picker;
}

function renderEmojisInPicker(picker: HTMLElement, searchTerm: string = "") {
  const grid = picker.querySelector(".meet-emoji-picker-grid");
  if (!grid) return;

  const filteredEmojis = emojis.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (emojis.length === 0) {
    grid.innerHTML = `<div class="meet-emoji-picker-empty">Please login via the extension popup to load emojis</div>`;
    return;
  }

  if (filteredEmojis.length === 0) {
    grid.innerHTML = `<div class="meet-emoji-picker-empty">No emojis found</div>`;
    return;
  }

  grid.innerHTML = filteredEmojis
    .map(
      (emoji) => `
      <button class="meet-emoji-picker-item" data-emoji-name="${emoji.name}" data-emoji-url="${emoji.url}" title=":${emoji.name}:">
        <img src="${emoji.url}" alt="${emoji.name}" loading="lazy" />
      </button>
    `
    )
    .join("");

  grid.querySelectorAll(".meet-emoji-picker-item").forEach((item) => {
    item.addEventListener("click", () => {
      const emojiName = item.getAttribute("data-emoji-name");
      const emojiUrl = item.getAttribute("data-emoji-url");
      if (emojiName && emojiUrl && currentPickerMessageId) {
        if (meetingId) {
          const existing = messageReactions
            .get(currentPickerMessageId)
            ?.get(emojiName);
          const hasMine =
            !!currentUserId &&
            !!existing &&
            existing.userIds.has(currentUserId);
          if (hasMine) {
            deleteReaction({
              meetingId,
              messageId: currentPickerMessageId,
              emojiName,
              emojiUrl,
            });
          } else {
            postReaction({
              meetingId,
              messageId: currentPickerMessageId,
              emojiName,
              emojiUrl,
            });
          }
        } else {
          console.log("[MeetEmoji] No meetingId, cannot broadcast reaction");
        }
        closePicker();
      }
    });
  });
}

function showPicker(messageId: string, x: number, y: number) {
  closePicker();

  currentPickerMessageId = messageId;
  pickerElement = createEmojiPicker();
  document.body.appendChild(pickerElement);

  const pickerRect = pickerElement.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = x;
  let top = y;

  if (left + pickerRect.width > windowWidth) {
    left = windowWidth - pickerRect.width - 16;
  }
  if (top + 400 > windowHeight) {
    top = y - 400;
  }

  pickerElement.style.left = `${Math.max(16, left)}px`;
  pickerElement.style.top = `${Math.max(16, top)}px`;

  renderEmojisInPicker(pickerElement);

  const searchInput = pickerElement.querySelector(
    ".meet-emoji-picker-search"
  ) as HTMLInputElement;
  setTimeout(() => searchInput?.focus(), 100);

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

function closePicker() {
  if (pickerElement) {
    pickerElement.remove();
    pickerElement = null;
  }
  currentPickerMessageId = null;
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(e: MouseEvent) {
  if (pickerElement && !pickerElement.contains(e.target as Node)) {
    closePicker();
  }
}

const messageReactions = new Map<
  string,
  Map<string, { url: string; userIds: Set<string> }>
>();

function applyReactionEvent(input: {
  messageId: string;
  emojiName: string;
  emojiUrl: string;
  userId: string;
  action: "add" | "remove";
}) {
  if (!messageReactions.has(input.messageId)) {
    messageReactions.set(input.messageId, new Map());
  }

  const reactions = messageReactions.get(input.messageId)!;
  const existing = reactions.get(input.emojiName);

  if (input.action === "add") {
    if (!existing) {
      reactions.set(input.emojiName, {
        url: input.emojiUrl,
        userIds: new Set([input.userId]),
      });
    } else {
      existing.userIds.add(input.userId);
      if (input.emojiUrl) {
        existing.url = input.emojiUrl;
      }
    }
  } else {
    if (existing) {
      existing.userIds.delete(input.userId);
      if (existing.userIds.size === 0) {
        reactions.delete(input.emojiName);
      }
    }
  }

  if (reactions.size === 0) {
    messageReactions.delete(input.messageId);
  }

  updateReactionsUI(input.messageId);
}

function updateReactionsUI(messageId: string) {
  const emojiBar = document.querySelector(
    `.meet-emoji-bar[data-for-message="${messageId}"]`
  );
  if (!emojiBar) return;

  const reactions = messageReactions.get(messageId);

  emojiBar
    .querySelectorAll(".meet-emoji-reaction")
    .forEach((el) => el.remove());

  if (!reactions || reactions.size === 0) return;

  const addBtn = emojiBar.querySelector(".meet-emoji-add-btn");

  Array.from(reactions.entries()).forEach(([name, { url, userIds }]) => {
    const count = userIds.size;
    const isMine = !!currentUserId && userIds.has(currentUserId);
    const reactionEl = document.createElement("button");
    reactionEl.className = "meet-emoji-reaction";
    if (isMine) {
      reactionEl.classList.add("meet-emoji-reaction--mine");
    }
    reactionEl.title = `:${name}:`;
    reactionEl.innerHTML = `
      <img src="${url}" alt="${name}" />
      <span class="meet-emoji-reaction-count">${count}</span>
    `;
    reactionEl.addEventListener("mouseenter", () => {
      scheduleReactionTooltip(reactionEl, name, url);
    });
    reactionEl.addEventListener("mouseleave", () => {
      hideReactionTooltip();
    });
    reactionEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!meetingId) return;
      if (isMine) {
        deleteReaction({
          meetingId,
          messageId,
          emojiName: name,
          emojiUrl: url,
        });
      } else {
        postReaction({
          meetingId,
          messageId,
          emojiName: name,
          emojiUrl: url,
        });
      }
    });

    if (addBtn) {
      emojiBar.insertBefore(reactionEl, addBtn);
    } else {
      emojiBar.appendChild(reactionEl);
    }
  });
}

function injectReactionButton(messageElement: Element) {
  if (messageElement.querySelector(".meet-emoji-bar")) return;

  const messageId = messageElement.getAttribute("data-message-id");
  if (!messageId) return;

  const messageContent = messageElement.querySelector('[jsname="dTKtvb"]');
  if (!messageContent) return;

  const emojiBar = document.createElement("div");
  emojiBar.className = "meet-emoji-bar";
  emojiBar.setAttribute("data-for-message", messageId);

  const addBtn = document.createElement("button");
  addBtn.className = "meet-emoji-add-btn";
  addBtn.innerHTML = `${createReactionButtonSvg()} React`;
  addBtn.title = "Add reaction";

  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = addBtn.getBoundingClientRect();
    showPicker(messageId, rect.left, rect.bottom + 8);
  });

  emojiBar.appendChild(addBtn);

  messageContent.parentNode?.insertBefore(emojiBar, messageContent.nextSibling);

  if (messageReactions.has(messageId)) {
    updateReactionsUI(messageId);
  }
}

function processExistingMessages() {
  const messages = document.querySelectorAll("[data-message-id]");
  messages.forEach((msg) => injectReactionButton(msg));
}

function watchForMessages() {
  const observer = new MutationObserver(() => {
    const messages = document.querySelectorAll("[data-message-id]");
    messages.forEach((msg) => injectReactionButton(msg));
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[MeetEmoji] Watching for DOM changes (synchronous)");
}

async function init() {
  if (!window.location.hostname.includes("meet.google.com")) {
    return;
  }

  meetingId = getMeetingIdFromUrl();
  refreshCurrentUserId();

  console.log("[MeetEmoji] Initializing on Google Meet");

  injectStyles();

  await loadEmojis();

  if (meetingId) {
    console.log("[MeetEmoji] Subscribing meeting events", { meetingId });
    subscribeMeetingEvents(meetingId);
    if (meetingResubscribeTimer) {
      window.clearInterval(meetingResubscribeTimer);
    }
    meetingResubscribeTimer = window.setInterval(() => {
      if (!meetingId) return;
      subscribeMeetingEvents(meetingId);
    }, 15000);
  }

  processExistingMessages();
  watchForMessages();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes["backend_jwt"]) {
    console.log("[MeetEmoji] Auth changed, reloading emojis");
    loadEmojis();
    refreshCurrentUserId();
    if (meetingId) {
      console.log("[MeetEmoji] Resubscribing meeting events", { meetingId });
      subscribeMeetingEvents(meetingId);
    }
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (!meetingId) return;
  console.log("[MeetEmoji] Tab visible, resubscribing meeting events", { meetingId });
  subscribeMeetingEvents(meetingId);
});

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type !== MessageType.MeetingReactionEvent) return;
  if (!meetingId) return;
  if (message.payload.meetingId !== meetingId) return;
  console.log("[MeetEmoji] Meeting reaction event", {
    meetingId: message.payload.meetingId,
    messageId: message.payload.messageId,
    emojiName: message.payload.emojiName,
    action: message.payload.action,
    userId: message.payload.user?.id,
  });
  const userId = message.payload.user?.id;
  if (!userId) return;
  applyReactionEvent({
    messageId: message.payload.messageId,
    emojiName: message.payload.emojiName,
    emojiUrl: message.payload.emojiUrl,
    userId,
    action: message.payload.action,
  });
});

window.addEventListener("beforeunload", () => {
  if (!meetingId) return;
  if (meetingResubscribeTimer) {
    window.clearInterval(meetingResubscribeTimer);
    meetingResubscribeTimer = null;
  }
  chrome.runtime.sendMessage({
    type: MessageType.UnsubscribeMeetingEvents,
    payload: { meetingId },
  });
});
