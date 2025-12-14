import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthState, Message, MessageType } from "./slack/types";
import { BackendApiFacade } from "./api/backendApiFacade";
import type { SlackEmojiDto } from "./api/backendApiFacade";
import { Storage } from "./storage";

const styles = {
  container: {
    width: "340px",
    height: "600px",
    background: "#141619",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#fafafa",
    padding: "0",
    margin: "0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    boxSizing: "border-box" as const,
    border: "1px solid #27272a",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
  } as React.CSSProperties,

  header: {
    background: "#232529",
    padding: "14px 16px",
    borderBottom: "1px solid #27272a",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  } as React.CSSProperties,

  logo: {
    width: "32px",
    height: "32px",
    background: "#18181b",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    border: "1px solid #27272a",
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
    color: "rgba(250, 250, 250, 0.6)",
    margin: "2px 0 0 0",
  } as React.CSSProperties,

  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #27272a",
    flexShrink: 0,
  } as React.CSSProperties,

  userAvatarHover: {
    border: "2px solid rgba(255, 82, 82, 0.5)",
    boxShadow: "0 0 10px rgba(255, 82, 82, 0.3)",
  } as React.CSSProperties,

  content: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    overflow: "hidden",
    boxSizing: "border-box" as const,
    width: "100%",
  } as React.CSSProperties,

  centeredContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "16px",
    width: "100%",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  authenticatedLayout: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    overflow: "hidden",
  } as React.CSSProperties,

  emojiPane: {
    flex: 1,
    padding: "16px",
    overflow: "hidden",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  namePane: {
    height: "76px",
    padding: "10px 16px 8px",
    borderTop: "1px solid #27272a",
    background: "#232529",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
    gap: "4px",
    boxSizing: "border-box" as const,
    flexShrink: 0,
  } as React.CSSProperties,

  nameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  } as React.CSSProperties,

  nameLabel: {
    fontSize: "12px",
    color: "rgba(250, 250, 250, 0.6)",
  } as React.CSSProperties,

  nameValue: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#fafafa",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,

  nameFieldRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
  } as React.CSSProperties,

  iconButton: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: "1px solid #27272a",
    background: "#18181b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  } as React.CSSProperties,

  iconButtonPrimary: {
    background: "#fafafa",
    border: "1px solid #fafafa",
  } as React.CSSProperties,

  iconButtonDanger: {
    background: "#18181b",
    border: "1px solid #27272a",
  } as React.CSSProperties,

  rightControls: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  } as React.CSSProperties,

  nameInput: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #27272a",
    background: "#09090b",
    color: "#fafafa",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  loginContent: {
    textAlign: "center" as const,
  } as React.CSSProperties,

  slackIcon: {
    width: "80px",
    height: "80px",
    margin: "0 auto 24px",
    background: "#0b0b0c",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #27272a",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
  } as React.CSSProperties,

  welcomeTitle: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#fafafa",
  } as React.CSSProperties,

  welcomeText: {
    fontSize: "14px",
    color: "rgba(250, 250, 250, 0.65)",
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
    background: "#fafafa",
    border: "1px solid #fafafa",
    borderRadius: "12px",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
    letterSpacing: "0.3px",
  } as React.CSSProperties,

  slackButtonHover: {
    background: "rgba(250,250,250,0.9)",
    transform: "translateY(-2px)",
    boxShadow: "0 14px 46px rgba(0,0,0,0.6)",
  } as React.CSSProperties,

  emojiContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
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
    color: "#fafafa",
  } as React.CSSProperties,

  emojiCount: {
    fontSize: "12px",
    color: "rgba(250, 250, 250, 0.65)",
    background: "#18181b",
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid #27272a",
  } as React.CSSProperties,

  emojiSearch: {
    width: "100%",
    padding: "10px 14px",
    background: "#09090b",
    border: "1px solid #27272a",
    borderRadius: "10px",
    color: "#fafafa",
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
    background: "#1b1d21",
    borderRadius: "12px",
    border: "1px solid #27272a",
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
    border: "1px solid transparent",
    padding: "4px",
    minWidth: 0,
  } as React.CSSProperties,

  emojiItemHover: {
    background: "#18181b",
    border: "1px solid rgba(250,250,250,0.18)",
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
    border: "3px solid rgba(250, 250, 250, 0.12)",
    borderTop: "3px solid #fafafa",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,

  smallSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(9, 9, 11, 0.25)",
    borderTop: "2px solid #09090b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,

  loadingText: {
    fontSize: "14px",
    color: "rgba(250, 250, 250, 0.65)",
  } as React.CSSProperties,

  error: {
    background: "rgba(250, 250, 250, 0.04)",
    border: "1px solid #27272a",
    borderRadius: "10px",
    padding: "12px 16px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,

  errorText: {
    fontSize: "13px",
    color: "rgba(250, 250, 250, 0.75)",
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

const styleSheet = `
  *, *::before, *::after {
    box-sizing: border-box;
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
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonHover, setButtonHover] = useState(false);

  const [emojis, setEmojis] = useState<SlackEmojiDto[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: MessageType.GetAuthState },
      (response: Message) => {
        setIsLoading(false);
        if (response?.type === MessageType.AuthState) {
          setAuthState(response.payload);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) return;
    let cancelled = false;

    BackendApiFacade.getCurrentUser(authState.token)
      .then((user) => {
        if (cancelled) return;
        const next: AuthState = { ...authState, user };
        setAuthState(next);
        setNameDraft(user.name ?? "");
        return Storage.setAuthState(next);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load user");
      });

    return () => {
      cancelled = true;
    };
  }, [authState.isAuthenticated, authState.token]);

  useEffect(() => {
    if (authState.isAuthenticated && emojis.length === 0) {
      fetchEmojis();
    }
  }, [authState.isAuthenticated, authState.token]);

  const fetchEmojis = async () => {
    if (!authState.isAuthenticated) return;

    setIsLoadingEmojis(true);
    chrome.runtime.sendMessage(
      { type: MessageType.GetEmojis },
      (response: Message) => {
        try {
          if (response?.type === MessageType.EmojisSuccess) {
            setEmojis(response.payload);
            return;
          }
          if (response?.type === MessageType.EmojisError) {
            setError(response.payload);
            return;
          }
          setError("Failed to load emojis");
        } finally {
          setIsLoadingEmojis(false);
        }
      }
    );
  };

  const handleLogin = () => {
    setIsLoggingIn(true);
    setError(null);

    chrome.runtime.sendMessage(
      { type: MessageType.SlackLogin },
      (response: Message) => {
        setIsLoggingIn(false);

        if (response?.type === MessageType.SlackAuthSuccess) {
          setAuthState(response.payload);
        } else if (response?.type === MessageType.SlackAuthError) {
          setError(response.payload);
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage(
      { type: MessageType.Logout },
      (response: Message) => {
        if (response?.type === MessageType.AuthState) {
          setAuthState(response.payload);
          setEmojis([]);
          setIsEditingName(false);
          setNameDraft("");
        }
      }
    );
  };

  const saveName = async () => {
    if (!authState.isAuthenticated) return;
    const nextName = nameDraft.trim();
    setIsSavingName(true);
    setError(null);
    try {
      const user = await BackendApiFacade.updateMe({ name: nextName });
      const next: AuthState = {
        isAuthenticated: true,
        token: authState.token,
        user,
      };
      setAuthState(next);
      await Storage.setAuthState(next);
      setIsEditingName(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEmojiClick = (emoji: SlackEmojiDto) => {
    console.log("Clicked emoji:", emoji.name);
  };

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(emojiSearch.toLowerCase())
  );

  return (
    <>
      <style>{styleSheet}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Google meet slack emojis</h1>
            <p style={styles.subtitle}>
              {authState.isAuthenticated && authState.user?.slackTeamName
                ? authState.user.slackTeamName
                : "Slack integration for Google Meet"}
            </p>
          </div>
          {authState.isAuthenticated &&
            authState.user &&
            (authState.user.avatar ? (
              <img
                src={authState.user.avatar}
                alt={authState.user.name ?? "Slack user"}
                style={styles.userAvatar}
                onClick={handleLogout}
                title="Click to sign out"
              />
            ) : (
              <div
                style={{
                  ...styles.userAvatar,
                  background: "#18181b",
                  border: "1px solid #27272a",
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
            <div style={styles.centeredContent}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Loading...</span>
            </div>
          ) : isLoggingIn ? (
            <div style={styles.centeredContent}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Connecting to Slack...</span>
            </div>
          ) : authState.isAuthenticated ? (
            <div style={styles.authenticatedLayout}>
              <div style={styles.emojiPane}>
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
                    <div
                      style={{ ...styles.centeredContent, flex: 1, padding: 0 }}
                    >
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
                </div>
              </div>

              <div style={styles.namePane}>
                <div style={styles.nameLabel}>Name</div>
                <div style={styles.nameFieldRow}>
                  {isEditingName ? (
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      style={styles.nameInput}
                      disabled={isSavingName}
                    />
                  ) : (
                    <div style={{ ...styles.nameValue, flex: 1 }}>
                      {authState.user?.name ?? ""}
                    </div>
                  )}

                  <div style={styles.rightControls}>
                    {isEditingName ? (
                      <>
                        <button
                          type="button"
                          style={{
                            ...styles.iconButton,
                            ...styles.iconButtonPrimary,
                          }}
                          onClick={saveName}
                          disabled={isSavingName}
                          title="Save"
                        >
                          {isSavingName ? (
                            <div style={styles.smallSpinner} />
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17l-5-5"
                                stroke="#09090b"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.iconButton,
                            ...styles.iconButtonDanger,
                          }}
                          onClick={() => {
                            setIsEditingName(false);
                            setNameDraft(authState.user?.name ?? "");
                          }}
                          disabled={isSavingName}
                          title="Cancel"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18"
                              stroke="rgba(250,250,250,0.9)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M6 6l12 12"
                              stroke="rgba(250,250,250,0.9)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        style={styles.iconButton}
                        onClick={() => {
                          setIsEditingName(true);
                          setNameDraft(authState.user?.name ?? "");
                        }}
                        title="Edit name"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 20H21"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {error ? (
                  <div style={styles.error}>
                    <span style={styles.errorText}>{error}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={styles.centeredContent}>
              <div style={styles.loginContent}>
                <div style={styles.slackIcon}>
                  <SlackLogo size={44} />
                </div>
                <h2 style={styles.welcomeTitle}>Welcome!</h2>
                <p style={styles.welcomeText}>
                  Connect your Slack workspace to react with emojis during
                  Google Meet calls.
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
