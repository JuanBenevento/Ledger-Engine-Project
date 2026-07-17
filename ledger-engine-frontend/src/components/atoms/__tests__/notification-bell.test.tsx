import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock the auth hook
vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-1", email: "test@test.com" },
  }),
}));

// Mock ably module
vi.mock("@/lib/ably", () => ({
  createNotificationChannel: () => ({
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

import api from "@/lib/api/client";
import { NotificationBell } from "@/components/atoms/notification-bell";

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

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bell icon with aria-label for accessibility", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 0 },
      error: null,
    });

    render(<NotificationBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByLabelText("Notificaciones");
    expect(bellButton).toBeInTheDocument();
    // Verify it's a button element
    expect(bellButton.tagName).toBe("BUTTON");
  });

  it("shows unread count badge when notifications are unread", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 5 },
      error: null,
    });

    render(<NotificationBell />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("does not render badge when unread count is 0", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 0 },
      error: null,
    });

    render(<NotificationBell />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(api.GET).toHaveBeenCalled();
    });

    // No badge text should appear
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("calls the notifications API on mount", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 2 },
      error: null,
    });

    render(<NotificationBell />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(api.GET).toHaveBeenCalled();
    });

    // Both useUnreadCount and useNotifications call the same endpoint
    expect(api.GET.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("renders as a button element for keyboard accessibility", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 0 },
      error: null,
    });

    render(<NotificationBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByLabelText("Notificaciones");
    // Should be focusable via keyboard
    expect(bellButton).toHaveAttribute("type", "button");
  });
});
