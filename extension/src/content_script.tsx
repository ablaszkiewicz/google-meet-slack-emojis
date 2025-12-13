// Content script for Google Meet emoji reactions
console.log("[MeetEmoji] Content script loaded on Google Meet");

// Emoji interface
interface SlackEmoji {
  name: string;
  url: string;
}

// State
let emojis: SlackEmoji[] = [];
let currentPickerMessageId: string | null = null;
let pickerElement: HTMLElement | null = null;

// Inject styles
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Emoji reaction bar - always visible under message */
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
      border: 1px dashed rgba(255, 255, 255, 0.3);
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-family: inherit;
    }

    .meet-emoji-add-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
      color: rgba(255, 255, 255, 0.9);
    }

    .meet-emoji-add-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    /* Emoji picker */
    .meet-emoji-picker {
      position: fixed;
      width: 320px;
      max-height: 400px;
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .meet-emoji-picker-header {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .meet-emoji-picker-title {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    .meet-emoji-picker-close {
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      line-height: 1;
    }

    .meet-emoji-picker-close:hover {
      background: rgba(255, 82, 82, 0.3);
      color: #ff5252;
    }

    .meet-emoji-picker-search {
      margin: 12px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      outline: none;
      width: calc(100% - 24px);
      box-sizing: border-box;
    }

    .meet-emoji-picker-search::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .meet-emoji-picker-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      padding: 8px 12px;
      overflow-y: auto;
      flex: 1;
      max-height: 280px;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar {
      width: 6px;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .meet-emoji-picker-grid::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
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
      border: none;
      padding: 6px;
      transition: all 0.15s ease;
    }

    .meet-emoji-picker-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(1.1);
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
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
    }

    .meet-emoji-picker-loading {
      padding: 24px;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
    }

    /* Individual reaction badge */
    .meet-emoji-reaction {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px 2px 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: default;
      transition: all 0.2s ease;
    }

    .meet-emoji-reaction:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .meet-emoji-reaction img {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    .meet-emoji-reaction-count {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

// Load emojis via background script (to avoid CORS issues)
async function loadEmojis(): Promise<void> {
  return new Promise((resolve) => {
    console.log("[MeetEmoji] Requesting emojis from background script...");

    chrome.runtime.sendMessage({ type: "SLACK_GET_EMOJIS" }, (response) => {
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

      if (response.type === "SLACK_EMOJIS_SUCCESS") {
        emojis = response.payload;
        console.log(`[MeetEmoji] Loaded ${emojis.length} emojis`);
      } else if (response.type === "SLACK_EMOJIS_ERROR") {
        console.error("[MeetEmoji] Error:", response.payload);
      }

      resolve();
    });
  });
}

// Create reaction button SVG
function createReactionButtonSvg(): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.79 0 1.5-.71 1.5-1.5S8.79 9 8 9s-1.5.71-1.5 1.5S7.21 12 8 12zm8 0c.79 0 1.5-.71 1.5-1.5S16.79 9 16 9s-1.5.71-1.5 1.5.71 1.5 1.5 1.5zm-4 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>`;
}

// Create emoji picker
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

  // Close button
  picker
    .querySelector(".meet-emoji-picker-close")
    ?.addEventListener("click", () => {
      closePicker();
    });

  // Search functionality
  const searchInput = picker.querySelector(
    ".meet-emoji-picker-search"
  ) as HTMLInputElement;
  searchInput?.addEventListener("input", () => {
    renderEmojisInPicker(picker, searchInput.value);
  });

  // Prevent clicks inside picker from closing it
  picker.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return picker;
}

// Render emojis in picker
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

  // Add click handlers
  grid.querySelectorAll(".meet-emoji-picker-item").forEach((item) => {
    item.addEventListener("click", () => {
      const emojiName = item.getAttribute("data-emoji-name");
      const emojiUrl = item.getAttribute("data-emoji-url");
      if (emojiName && emojiUrl && currentPickerMessageId) {
        addReactionToMessage(currentPickerMessageId, emojiName, emojiUrl);
        closePicker();
      }
    });
  });
}

// Show picker at position
function showPicker(messageId: string, x: number, y: number) {
  closePicker(); // Close any existing picker

  currentPickerMessageId = messageId;
  pickerElement = createEmojiPicker();
  document.body.appendChild(pickerElement);

  // Position the picker
  const pickerRect = pickerElement.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = x;
  let top = y;

  // Adjust if goes off screen
  if (left + pickerRect.width > windowWidth) {
    left = windowWidth - pickerRect.width - 16;
  }
  if (top + 400 > windowHeight) {
    top = y - 400;
  }

  pickerElement.style.left = `${Math.max(16, left)}px`;
  pickerElement.style.top = `${Math.max(16, top)}px`;

  // Render emojis
  renderEmojisInPicker(pickerElement);

  // Focus search input
  const searchInput = pickerElement.querySelector(
    ".meet-emoji-picker-search"
  ) as HTMLInputElement;
  setTimeout(() => searchInput?.focus(), 100);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

// Close picker
function closePicker() {
  if (pickerElement) {
    pickerElement.remove();
    pickerElement = null;
  }
  currentPickerMessageId = null;
  document.removeEventListener("click", handleOutsideClick);
}

// Handle outside click
function handleOutsideClick(e: MouseEvent) {
  if (pickerElement && !pickerElement.contains(e.target as Node)) {
    closePicker();
  }
}

// Store for reactions (in-memory for now, keyed by message ID)
const messageReactions = new Map<
  string,
  Map<string, { url: string; count: number }>
>();

// Add reaction to message
function addReactionToMessage(
  messageId: string,
  emojiName: string,
  emojiUrl: string
) {
  console.log(
    `[MeetEmoji] Adding reaction :${emojiName}: to message ${messageId}`
  );

  // Get or create reactions for this message
  if (!messageReactions.has(messageId)) {
    messageReactions.set(messageId, new Map());
  }

  const reactions = messageReactions.get(messageId)!;

  if (reactions.has(emojiName)) {
    // Increment count
    const reaction = reactions.get(emojiName)!;
    reaction.count++;
  } else {
    // Add new reaction
    reactions.set(emojiName, { url: emojiUrl, count: 1 });
  }

  // Update UI
  updateReactionsUI(messageId);
}

// Update reactions UI for a message
function updateReactionsUI(messageId: string) {
  // Find the emoji bar for this message
  const emojiBar = document.querySelector(
    `.meet-emoji-bar[data-for-message="${messageId}"]`
  );
  if (!emojiBar) return;

  const reactions = messageReactions.get(messageId);

  // Remove existing reaction elements (but keep the add button)
  emojiBar
    .querySelectorAll(".meet-emoji-reaction")
    .forEach((el) => el.remove());

  if (!reactions || reactions.size === 0) return;

  // Get the add button to insert reactions before it
  const addBtn = emojiBar.querySelector(".meet-emoji-add-btn");

  // Add reaction elements
  Array.from(reactions.entries()).forEach(([name, { url, count }]) => {
    const reactionEl = document.createElement("div");
    reactionEl.className = "meet-emoji-reaction";
    reactionEl.title = `:${name}:`;
    reactionEl.innerHTML = `
      <img src="${url}" alt="${name}" />
      <span class="meet-emoji-reaction-count">${count}</span>
    `;

    // Insert before the add button
    if (addBtn) {
      emojiBar.insertBefore(reactionEl, addBtn);
    } else {
      emojiBar.appendChild(reactionEl);
    }
  });
}

// Inject reaction button into a message
function injectReactionButton(messageElement: Element) {
  // Check if already injected
  if (messageElement.querySelector(".meet-emoji-bar")) return;

  const messageId = messageElement.getAttribute("data-message-id");
  if (!messageId) return;

  // Find the message text container - look for the div that contains the actual message text
  // Based on the HTML structure: .ptNLrf contains the message content
  const messageContent = messageElement.querySelector('[jsname="dTKtvb"]');
  if (!messageContent) return;

  // Create emoji bar container
  const emojiBar = document.createElement("div");
  emojiBar.className = "meet-emoji-bar";
  emojiBar.setAttribute("data-for-message", messageId);

  // Create "Add reaction" button
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

  // Insert the emoji bar after the message content
  messageContent.parentNode?.insertBefore(emojiBar, messageContent.nextSibling);
}

// Process all existing messages
function processExistingMessages() {
  const messages = document.querySelectorAll("[data-message-id]");
  messages.forEach((msg) => injectReactionButton(msg));
  console.log(`[MeetEmoji] Processed ${messages.length} existing messages`);
}

// Watch for new messages
function watchForMessages() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          // Check if the node itself is a message
          if (node.hasAttribute("data-message-id")) {
            injectReactionButton(node);
          }
          // Check for messages within the added node
          const messages = node.querySelectorAll("[data-message-id]");
          messages.forEach((msg) => injectReactionButton(msg));
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[MeetEmoji] Watching for new messages");
}

// Initialize
async function init() {
  // Only run on Google Meet
  if (!window.location.hostname.includes("meet.google.com")) {
    return;
  }

  console.log("[MeetEmoji] Initializing on Google Meet");

  // Inject styles
  injectStyles();

  // Load emojis
  await loadEmojis();

  // Process existing messages and watch for new ones
  processExistingMessages();
  watchForMessages();

  // Reprocess periodically in case messages load later
  setInterval(() => {
    processExistingMessages();
  }, 2000);
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Also listen for storage changes to reload emojis when user logs in
// Listen for storage changes to reload emojis when user logs in
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes["slack_bot_token"]) {
    console.log("[MeetEmoji] Token changed, reloading emojis");
    loadEmojis();
  }
});
