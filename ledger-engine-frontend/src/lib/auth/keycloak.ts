import Keycloak from "keycloak-js";

/**
 * Keycloak configuration for Ledger Engine.
 *
 * Uses environment variables for flexible deployment across
 * staging/production environments.
 */
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8180",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "ledger-engine",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "ledger-engine-web",
};

/**
 * Initialize Keycloak instance.
 * Should be called once in the app lifecycle.
 */
export function initKeycloak(): Keycloak {
  return new Keycloak(keycloakConfig);
}

/**
 * Keycloak initialization options.
 */
export const keycloakInitOptions = {
  onLoad: "check-sso" as const,
  silentCheckSsoRedirectUri:
    typeof window !== "undefined"
      ? `${window.location.origin}/silent-check-sso.html`
      : "",
  pkceMethod: "S256" as const,
  enableLogging: process.env.NODE_ENV === "development",
};

/**
 * Token refresh configuration.
 * Refresh 2 minutes before expiry to avoid race conditions.
 */
export const TOKEN_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes in ms
