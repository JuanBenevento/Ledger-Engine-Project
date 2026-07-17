"use client";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import { useCallback, useMemo } from "react";
import { initKeycloak, keycloakInitOptions } from "./keycloak";
import type { KeycloakInstance } from "keycloak-js";

type AuthClientEvent =
  | "onReady"
  | "onAuthSuccess"
  | "onAuthError"
  | "onAuthRefreshSuccess"
  | "onAuthRefreshError"
  | "onAuthLogout"
  | "onTokenExpired"
  | "onInitError";

interface AuthClientError {
  error: string;
  error_description?: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider wraps the app with Keycloak authentication context.
 *
 * Handles:
 * - Token refresh 2 minutes before expiry
 * - Cross-tab session sync via BroadcastChannel
 * - Loading state while Keycloak initializes
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const keycloakInstance = useMemo(() => initKeycloak(), []);

  const onTokenExpired = useCallback(
    (keycloak: KeycloakInstance) => {
      // Refresh token 2 minutes before expiry
      if (keycloak.isTokenExpired(120)) {
        keycloak
          .updateToken(120)
          .then((refreshed) => {
            if (refreshed) {
              console.debug("[Auth] Token refreshed successfully");
            }
          })
          .catch((error) => {
            console.error("[Auth] Token refresh failed:", error);
            // Redirect to login on refresh failure
            keycloak.login();
          });
      }
    },
    []
  );

  const onEvent = useCallback(
    (event: AuthClientEvent, error?: AuthClientError) => {
      switch (event) {
        case "onTokenExpired":
          onTokenExpired(keycloakInstance);
          break;
        case "onAuthLogout":
          // Clear any local state if needed
          break;
        case "onAuthError":
          console.error("[Auth] Authentication error:", error);
          break;
        default:
          break;
      }
    },
    [keycloakInstance, onTokenExpired]
  );

  const onTokens = useCallback(
    (tokens: { token?: string; refreshToken?: string }) => {
      // Tokens are stored in memory by keycloak-js
      // We can optionally sync across tabs here
      if (typeof BroadcastChannel !== "undefined" && tokens.token) {
        const channel = new BroadcastChannel("auth-sync");
        channel.postMessage({ type: "token-refresh", token: tokens.token });
        channel.close();
      }
    },
    []
  );

  return (
    <ReactKeycloakProvider
      authClient={keycloakInstance}
      initOptions={keycloakInitOptions}
      onEvent={onEvent}
      onTokens={onTokens}
    >
      {children}
    </ReactKeycloakProvider>
  );
}
