import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { SlackAuthState, SlackMessage } from "./slack/types";
import { getWorkspaceEmojis, getBotToken, SlackEmoji } from "./slack/auth";

// Inline styles for the popup
const styles = {
  container: {
    width: "340px",
    minHeight: "400px",
    maxHeight: "600px",
    background:
      "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
    padding: "0",
    margin: "0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  header: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  } as React.CSSProperties,

  logo: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #00d4aa 0%, #00b894 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    boxShadow: "0 4px 15px rgba(0, 212, 170, 0.3)",
  } as React.CSSProperties,

  headerText: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
  } as React.CSSProperties,

  title: {
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.3px",
  } as React.CSSProperties,

  subtitle: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.6)",
    margin: "2px 0 0 0",
  } as React.CSSProperties,

  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    flexShrink: 0,
  } as React.CSSProperties,

  userAvatarHover: {
    border: "2px solid rgba(255, 82, 82, 0.5)",
    boxShadow: "0 0 10px rgba(255, 82, 82, 0.3)",
  } as React.CSSProperties,

  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    overflow: "hidden",
    boxSizing: "border-box" as const,
    width: "100%",
  } as React.CSSProperties,

  loginContent: {
    textAlign: "center" as const,
    animation: "fadeIn 0.3s ease",
  } as React.CSSProperties,

  slackIcon: {
    width: "80px",
    height: "80px",
    margin: "0 auto 24px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  } as React.CSSProperties,

  welcomeTitle: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "8px",
    background: "linear-gradient(135deg, #ffffff 0%, #a8dadc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  } as React.CSSProperties,

  welcomeText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.65)",
    marginBottom: "32px",
    lineHeight: 1.5,
    maxWidth: "260px",
  } as React.CSSProperties,

  slackButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "14px 24px",
    background: "#4A154B",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(74, 21, 75, 0.4)",
    letterSpacing: "0.3px",
  } as React.CSSProperties,

  slackButtonHover: {
    background: "#611f69",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 25px rgba(74, 21, 75, 0.5)",
  } as React.CSSProperties,

  emojiContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    animation: "fadeIn 0.3s ease",
    overflow: "hidden",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  emojiHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    flexShrink: 0,
  } as React.CSSProperties,

  emojiTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.9)",
  } as React.CSSProperties,

  emojiCount: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "4px 10px",
    borderRadius: "12px",
  } as React.CSSProperties,

  emojiSearch: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "13px",
    marginBottom: "12px",
    outline: "none",
    flexShrink: 0,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    flex: 1,
    padding: "8px",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  emojiItem: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    background: "transparent",
    border: "none",
    padding: "4px",
    minWidth: 0,
  } as React.CSSProperties,

  emojiItemHover: {
    background: "rgba(255, 255, 255, 0.15)",
    transform: "scale(1.1)",
  } as React.CSSProperties,

  emojiImage: {
    width: "100%",
    height: "100%",
    maxWidth: "32px",
    maxHeight: "32px",
    objectFit: "contain" as const,
  } as React.CSSProperties,

  loading: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "16px",
  } as React.CSSProperties,

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255, 255, 255, 0.1)",
    borderTop: "3px solid #00d4aa",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,

  loadingText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.6)",
  } as React.CSSProperties,

  error: {
    background: "rgba(255, 82, 82, 0.15)",
    border: "1px solid rgba(255, 82, 82, 0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,

  errorText: {
    fontSize: "13px",
    color: "#ff8a8a",
    lineHeight: 1.4,
  } as React.CSSProperties,

  logoutButton: {
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "11px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
};

// CSS keyframes for animations
const styleSheet = `
  *, *::before, *::after {
    box-sizing: border-box;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 340px;
    overflow-x: hidden;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Slack logo SVG component
const SlackLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
    <path
      d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"
      fill="#36C5F0"
    />
    <path
      d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"
      fill="#2EB67D"
    />
    <path
      d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"
      fill="#ECB22E"
    />
    <path
      d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"
      fill="#E01E5A"
    />
  </svg>
);

const Popup = () => {
  const [authState, setAuthState] = useState<SlackAuthState>({
    isAuthenticated: false,
    user: null,
    team: null,
    accessToken: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonHover, setButtonHover] = useState(false);

  // Emoji state
  const [emojis, setEmojis] = useState<SlackEmoji[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  // Fetch auth state on mount
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "SLACK_GET_AUTH_STATE" },
      (response: SlackMessage) => {
        setIsLoading(false);
        if (response?.type === "SLACK_AUTH_STATE") {
          setAuthState(response.payload);
        }
      }
    );
  }, []);

  // Fetch emojis when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && emojis.length === 0) {
      fetchEmojis();
    }
  }, [authState.isAuthenticated, authState.accessToken]);

  const fetchEmojis = async () => {
    if (!authState.isAuthenticated) return;

    setIsLoadingEmojis(true);
    try {
      // Use bot token for emoji access
      const botToken = await getBotToken();
      if (!botToken) {
        throw new Error(
          "No bot token available. Please sign out and sign in again."
        );
      }
      const emojiList = await getWorkspaceEmojis(botToken);
      setEmojis(emojiList);
      console.log(`[Popup] Loaded ${emojiList.length} emojis`);
    } catch (err) {
      console.error("[Popup] Failed to load emojis:", err);
      setError(err instanceof Error ? err.message : "Failed to load emojis");
    } finally {
      setIsLoadingEmojis(false);
    }
  };

  const handleLogin = () => {
    setIsLoggingIn(true);
    setError(null);

    chrome.runtime.sendMessage(
      { type: "SLACK_LOGIN" },
      (response: SlackMessage) => {
        setIsLoggingIn(false);

        if (response?.type === "SLACK_AUTH_SUCCESS") {
          setAuthState(response.payload);
        } else if (response?.type === "SLACK_AUTH_ERROR") {
          setError(response.payload);
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage(
      { type: "SLACK_LOGOUT" },
      (response: SlackMessage) => {
        if (response?.type === "SLACK_AUTH_STATE") {
          setAuthState(response.payload);
          setEmojis([]);
        }
      }
    );
  };

  const handleEmojiClick = (emoji: SlackEmoji) => {
    console.log("Clicked emoji:", emoji.name);
    // TODO: Use this emoji for Google Meet reactions
  };

  // Filter emojis based on search
  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(emojiSearch.toLowerCase())
  );

  return (
    <>
      <style>{styleSheet}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>🎯</div>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Meet Emoji Reactions</h1>
            <p style={styles.subtitle}>
              {authState.isAuthenticated && authState.team
                ? authState.team.name
                : "Slack integration for Google Meet"}
            </p>
          </div>
          {authState.isAuthenticated &&
            authState.user &&
            (authState.user.image_72 ? (
              <img
                src={authState.user.image_72}
                alt={authState.user.name}
                style={styles.userAvatar}
                onClick={handleLogout}
                title="Click to sign out"
              />
            ) : (
              <div
                style={{
                  ...styles.userAvatar,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                onClick={handleLogout}
                title="Click to sign out"
              >
                {authState.user.name?.[0]?.toUpperCase() || "?"}
              </div>
            ))}
        </header>

        <div style={styles.content}>
          {isLoading ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Loading...</span>
            </div>
          ) : isLoggingIn ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Connecting to Slack...</span>
            </div>
          ) : authState.isAuthenticated ? (
            <div style={styles.emojiContent}>
              <div style={styles.emojiHeader}>
                <span style={styles.emojiTitle}>Custom Emojis</span>
                <span style={styles.emojiCount}>
                  {isLoadingEmojis
                    ? "Loading..."
                    : `${filteredEmojis.length} emojis`}
                </span>
              </div>

              <input
                type="text"
                placeholder="Search emojis..."
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                style={styles.emojiSearch}
              />

              {isLoadingEmojis ? (
                <div style={{ ...styles.loading, flex: 1 }}>
                  <div style={styles.spinner} />
                  <span style={styles.loadingText}>Loading emojis...</span>
                </div>
              ) : (
                <div style={styles.emojiGrid}>
                  {filteredEmojis.map((emoji) => (
                    <button
                      key={emoji.name}
                      style={{
                        ...styles.emojiItem,
                        ...(hoveredEmoji === emoji.name
                          ? styles.emojiItemHover
                          : {}),
                      }}
                      onClick={() => handleEmojiClick(emoji)}
                      onMouseEnter={() => setHoveredEmoji(emoji.name)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      title={`:${emoji.name}:`}
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        style={styles.emojiImage}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div style={styles.error}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span style={styles.errorText}>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.loginContent}>
              <div style={styles.slackIcon}>
                <SlackLogo size={44} />
              </div>
              <h2 style={styles.welcomeTitle}>Welcome!</h2>
              <p style={styles.welcomeText}>
                Connect your Slack workspace to react with emojis during Google
                Meet calls.
              </p>
              <button
                style={{
                  ...styles.slackButton,
                  ...(buttonHover ? styles.slackButtonHover : {}),
                }}
                onClick={handleLogin}
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
              >
                <SlackLogo size={20} />
                Sign in with Slack
              </button>

              {error && (
                <div style={styles.error}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span style={styles.errorText}>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
