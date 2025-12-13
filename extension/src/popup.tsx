import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { SlackAuthState, SlackMessage } from "./slack/types";

// Inline styles for the popup
const styles = {
  container: {
    width: "340px",
    minHeight: "400px",
    background:
      "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
    padding: "0",
    margin: "0",
    overflow: "hidden",
  } as React.CSSProperties,

  header: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,

  logo: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #00d4aa 0%, #00b894 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 4px 15px rgba(0, 212, 170, 0.3)",
  } as React.CSSProperties,

  headerText: {
    display: "flex",
    flexDirection: "column" as const,
  } as React.CSSProperties,

  title: {
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.3px",
  } as React.CSSProperties,

  subtitle: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    margin: "2px 0 0 0",
  } as React.CSSProperties,

  content: {
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "280px",
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

  profileContent: {
    width: "100%",
    animation: "fadeIn 0.3s ease",
  } as React.CSSProperties,

  profileCard: {
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  } as React.CSSProperties,

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  } as React.CSSProperties,

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    objectFit: "cover" as const,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  } as React.CSSProperties,

  avatarPlaceholder: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  } as React.CSSProperties,

  userInfo: {
    flex: 1,
  } as React.CSSProperties,

  userName: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "4px",
  } as React.CSSProperties,

  userEmail: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
  } as React.CSSProperties,

  teamBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(0, 212, 170, 0.15)",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 212, 170, 0.3)",
  } as React.CSSProperties,

  teamDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00d4aa",
    boxShadow: "0 0 10px rgba(0, 212, 170, 0.5)",
  } as React.CSSProperties,

  teamName: {
    fontSize: "13px",
    color: "#00d4aa",
    fontWeight: 500,
  } as React.CSSProperties,

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "rgba(0, 212, 170, 0.1)",
    borderRadius: "10px",
    marginBottom: "16px",
    border: "1px solid rgba(0, 212, 170, 0.2)",
  } as React.CSSProperties,

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#00d4aa",
    animation: "pulse 2s infinite",
    boxShadow: "0 0 10px rgba(0, 212, 170, 0.5)",
  } as React.CSSProperties,

  statusText: {
    fontSize: "13px",
    color: "#00d4aa",
    fontWeight: 500,
  } as React.CSSProperties,

  logoutButton: {
    width: "100%",
    padding: "12px 24px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  logoutButtonHover: {
    background: "rgba(255, 82, 82, 0.15)",
    borderColor: "rgba(255, 82, 82, 0.3)",
    color: "#ff5252",
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
};

// CSS keyframes for animations
const styleSheet = `
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
  
  body {
    margin: 0;
    padding: 0;
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
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    // Fetch current auth state on mount
    chrome.runtime.sendMessage(
      { type: "SLACK_GET_AUTH_STATE" },
      (response: SlackMessage) => {
        setIsLoading(false);
        if (response.type === "SLACK_AUTH_STATE") {
          setAuthState(response.payload);
        }
      }
    );
  }, []);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setError(null);

    chrome.runtime.sendMessage(
      { type: "SLACK_LOGIN" },
      (response: SlackMessage) => {
        setIsLoggingIn(false);

        if (response.type === "SLACK_AUTH_SUCCESS") {
          setAuthState(response.payload);
        } else if (response.type === "SLACK_AUTH_ERROR") {
          setError(response.payload);
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage(
      { type: "SLACK_LOGOUT" },
      (response: SlackMessage) => {
        if (response.type === "SLACK_AUTH_STATE") {
          setAuthState(response.payload);
        }
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <style>{styleSheet}</style>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>🎯</div>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Meet Emoji Reactions</h1>
            <p style={styles.subtitle}>Slack integration for Google Meet</p>
          </div>
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
            <div style={styles.profileContent}>
              <div style={styles.statusBadge}>
                <div style={styles.statusDot} />
                <span style={styles.statusText}>Connected to Slack</span>
              </div>

              <div style={styles.profileCard}>
                <div style={styles.profileHeader}>
                  {authState.user?.image_72 ? (
                    <img
                      src={authState.user.image_72}
                      alt={authState.user.name}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {authState.user?.name
                        ? getInitials(authState.user.name)
                        : "?"}
                    </div>
                  )}
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>
                      {authState.user?.name || "User"}
                    </div>
                    <div style={styles.userEmail}>
                      {authState.user?.email || ""}
                    </div>
                  </div>
                </div>

                {authState.team && (
                  <div style={styles.teamBadge}>
                    <div style={styles.teamDot} />
                    <span style={styles.teamName}>{authState.team.name}</span>
                  </div>
                )}
              </div>

              <button
                style={{
                  ...styles.logoutButton,
                  ...(logoutHover ? styles.logoutButtonHover : {}),
                }}
                onClick={handleLogout}
                onMouseEnter={() => setLogoutHover(true)}
                onMouseLeave={() => setLogoutHover(false)}
              >
                Sign out
              </button>
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
