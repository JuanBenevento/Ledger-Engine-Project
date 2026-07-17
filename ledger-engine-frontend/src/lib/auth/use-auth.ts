"use client";

import { useKeycloak } from "@react-keycloak/web";
import { useMemo } from "react";

/**
 * Custom hook for authentication state and actions.
 *
 * Provides a simplified interface over Keycloak:
 * - isAuthenticated: whether user is logged in
 * - user: decoded user info
 * - login/logout: convenience methods
 * - hasRole: role checking helper
 */
export function useAuth() {
  const { keycloak, initialized } = useKeycloak();

  const user = useMemo(() => {
    if (!keycloak?.authenticated || !keycloak.tokenParsed) {
      return null;
    }

    return {
      id: keycloak.subject,
      email: keycloak.tokenParsed.email as string | undefined,
      firstName: keycloak.tokenParsed.given_name as string | undefined,
      lastName: keycloak.tokenParsed.family_name as string | undefined,
      roles: (keycloak.tokenParsed.realm_access as { roles?: string[] })
        ?.roles ?? [],
    };
  }, [keycloak]);

  const hasRole = useMemo(() => {
    return (role: string): boolean => {
      if (!keycloak?.authenticated) return false;
      return keycloak.hasRealmRole(role);
    };
  }, [keycloak]);

  const login = useMemo(() => {
    return () => {
      keycloak?.login();
    };
  }, [keycloak]);

  const logout = useMemo(() => {
    return () => {
      keycloak?.logout({
        redirectUri: window.location.origin,
      });
    };
  }, [keycloak]);

  const getToken = useMemo(() => {
    return (): string | undefined => {
      return keycloak?.token;
    };
  }, [keycloak]);

  return {
    /** Whether Keycloak has finished initializing */
    initialized,
    /** Whether user is authenticated */
    isAuthenticated: keycloak?.authenticated ?? false,
    /** Decoded user information */
    user,
    /** Check if user has a specific realm role */
    hasRole,
    /** Redirect to Keycloak login */
    login,
    /** Logout and clear session */
    logout,
    /** Get current access token */
    getToken,
    /** Raw Keycloak instance (for advanced use) */
    keycloak,
  };
}
