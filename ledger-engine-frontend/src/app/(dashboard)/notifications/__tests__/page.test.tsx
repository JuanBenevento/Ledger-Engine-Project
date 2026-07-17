import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
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
import NotificationListPage from "@/app/(dashboard)/notifications/page";

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

describe("NotificationListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: {
        content: [],
        unreadCount: 0,
      },
      error: null,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    });
  });

  it("shows empty state when no notifications", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: {
        content: [],
        unreadCount: 0,
      },
      error: null,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    });

    expect(screen.getByText(/sin notificaciones/i)).toBeInTheDocument();
  });

  it("renders notification items when data is present", async () => {
    const notifications = [
      {
        notification_id: "notif-1",
        type: "TOPUP_COMPLETED",
        title: "Recarga completada",
        message: "Tu recarga de $ 100.000 fue exitosa",
        is_read: false,
        created_at: "2026-07-14T10:00:00Z",
      },
      {
        notification_id: "notif-2",
        type: "P2P_RECEIVED",
        title: "Dinero recibido",
        message: "Carlos M. te envió $ 50.000",
        is_read: true,
        created_at: "2026-07-14T09:00:00Z",
      },
    ];

    vi.mocked(api.GET).mockResolvedValue({
      data: {
        content: notifications,
        unreadCount: 1,
      },
      error: null,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Recarga completada")).toBeInTheDocument();
    });

    expect(screen.getByText("Dinero recibido")).toBeInTheDocument();
  });

  it("shows mark all as read button when there are unread notifications", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: {
        content: [
          {
            notification_id: "notif-1",
            type: "TOPUP_COMPLETED",
            title: "Test",
            message: "Test message",
            is_read: false,
            created_at: "2026-07-14T10:00:00Z",
          },
        ],
        unreadCount: 1,
      },
      error: null,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /marcar todo leído/i })
    ).toBeInTheDocument();
  });

  it("hides mark all as read button when no unread notifications", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: {
        content: [],
        unreadCount: 0,
      },
      error: null,
    });

    render(<NotificationListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(api.GET).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("button", { name: /marcar todo leído/i })
    ).not.toBeInTheDocument();
  });
});
