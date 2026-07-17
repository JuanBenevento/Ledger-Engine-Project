import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
    DELETE: vi.fn(),
  },
}));

import api from "@/lib/api/client";
import { DeviceList } from "@/components/features/security/device-list";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe("DeviceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders device cards with correct information", async () => {
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

    vi.mocked(api.GET).mockResolvedValue({ data: { devices }, error: null });

    render(<DeviceList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });

    expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    expect(screen.getByText("Actual")).toBeInTheDocument();
  });

  it("shows revoke button only for non-current devices", async () => {
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

    vi.mocked(api.GET).mockResolvedValue({ data: { devices }, error: null });

    render(<DeviceList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    });

    // Only one revoke button for the non-current device
    const revokeButtons = screen.getAllByRole("button", { name: /revocar/i });
    expect(revokeButtons).toHaveLength(1);
  });

  it("shows confirmation dialog when revoke is clicked", async () => {
    const user = userEvent.setup();
    const devices = [
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

    vi.mocked(api.GET).mockResolvedValue({ data: { devices }, error: null });

    render(<DeviceList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    });

    // Click revoke button
    await user.click(screen.getByRole("button", { name: /revocar/i }));

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/¿Revocar Safari on iPhone\?/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("calls DELETE API when revoke is confirmed", async () => {
    const user = userEvent.setup();
    const devices = [
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

    vi.mocked(api.GET).mockResolvedValue({ data: { devices }, error: null });
    vi.mocked(api.DELETE).mockResolvedValue({ data: { revoked: true }, error: null });

    render(<DeviceList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    });

    // Click revoke and confirm
    await user.click(screen.getByRole("button", { name: /revocar/i }));

    await waitFor(() => {
      expect(screen.getByText(/¿Revocar Safari on iPhone\?/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    // Should call DELETE API
    await waitFor(() => {
      expect(api.DELETE).toHaveBeenCalledWith(
        "/api/v1/security/devices/{deviceId}",
        { params: { path: { deviceId: "device-2" } } }
      );
    });
  });

  it("shows empty state when no devices", async () => {
    vi.mocked(api.GET).mockResolvedValue({ data: { devices: [] }, error: null });

    render(<DeviceList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No hay dispositivos registrados")).toBeInTheDocument();
    });
  });
});
