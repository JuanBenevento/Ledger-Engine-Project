import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

// Mock the auth hook
vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-1", email: "test@test.com" },
  }),
}));

import api from "@/lib/api/client";
import SecuritySettingsPage from "@/app/(dashboard)/security/page";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe("SecuritySettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { devices: [] },
      error: null,
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Seguridad")).toBeInTheDocument();
    });
  });

  it("shows 2FA section with enable button when 2FA is not enabled", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { devices: [] },
      error: null,
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Autenticación de dos factores")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /habilitar 2fa/i })
    ).toBeInTheDocument();
  });

  it("shows device list section", async () => {
    const devices = [
      {
        deviceId: "device-1",
        name: "Chrome on Windows",
        os: "Windows",
        browser: "Chrome",
        lastLoginAt: new Date().toISOString(),
        isCurrentDevice: true,
        trusted: true,
      },
    ];

    vi.mocked(api.GET).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/devices") {
        return { data: { devices }, error: null };
      }
      return { data: {}, error: null };
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });

    expect(screen.getByText("Dispositivos")).toBeInTheDocument();
    expect(screen.getByText("Actual")).toBeInTheDocument();
  });

  it("shows multiple devices with revoke buttons for non-current devices", async () => {
    const devices = [
      {
        deviceId: "device-1",
        name: "Chrome on Windows",
        os: "Windows",
        browser: "Chrome",
        lastLoginAt: "2026-07-14T10:00:00Z",
        isCurrentDevice: true,
        trusted: true,
      },
      {
        deviceId: "device-2",
        name: "Safari on iPhone",
        os: "iOS",
        browser: "Safari",
        lastLoginAt: "2026-07-13T08:00:00Z",
        isCurrentDevice: false,
        trusted: true,
      },
    ];

    vi.mocked(api.GET).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/devices") {
        return { data: { devices }, error: null };
      }
      return { data: {}, error: null };
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });

    expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    expect(screen.getByText(/iOS · Safari/)).toBeInTheDocument();
    // Only the non-current device should have a revoke button
    const revokeButtons = screen.getAllByRole("button", { name: /revocar/i });
    expect(revokeButtons).toHaveLength(1);
    // Current device should show "Actual" badge
    expect(screen.getByText("Actual")).toBeInTheDocument();
  });

  it("shows empty state when no devices are registered", async () => {
    vi.mocked(api.GET).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/devices") {
        return { data: { devices: [] }, error: null };
      }
      return { data: {}, error: null };
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No hay dispositivos registrados")).toBeInTheDocument();
    });
  });

  it("shows security log section placeholder", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { devices: [] },
      error: null,
    });

    render(<SecuritySettingsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Registro de actividad")).toBeInTheDocument();
    });
  });
});
