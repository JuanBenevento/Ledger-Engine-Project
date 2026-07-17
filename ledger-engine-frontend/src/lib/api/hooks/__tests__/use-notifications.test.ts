import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("../../client", () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
  },
}));

import api from "../../client";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
} from "../use-notifications";

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

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches notifications successfully", async () => {
    const mockData = {
      content: [
        {
          notification_id: "notif-1",
          type: "TOPUP_COMPLETED",
          title: "Recarga completada",
          message: "Tu recarga fue exitosa",
          is_read: false,
          created_at: "2026-07-14T10:00:00Z",
        },
      ],
      unreadCount: 1,
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockData, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(0, 50), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content).toHaveLength(1);
    expect(result.current.data?.unreadCount).toBe(1);
    expect(result.current.data?.content[0].title).toBe("Recarga completada");
  });

  it("passes pagination parameters to API", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { content: [], unreadCount: 0 },
      error: null,
    });

    const wrapper = createWrapper();
    renderHook(() => useNotifications(2, 25), { wrapper });

    await waitFor(() => {
      expect(api.GET).toHaveBeenCalledWith("/api/v1/notifications", {
        params: { query: { page: 2, size: 25 } },
      });
    });
  });
});

describe("useUnreadCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches unread count successfully", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { unreadCount: 7 },
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUnreadCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.unreadCount).toBe(7);
  });
});

describe("useMarkNotificationRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks a notification as read", async () => {
    const mockResponse = {
      notification_id: "notif-1",
      is_read: true,
    };

    vi.mocked(api.PUT).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper,
    });

    await result.current.mutateAsync("notif-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.PUT).toHaveBeenCalledWith(
      "/api/v1/notifications/{id}/read",
      {
        params: { path: { id: "notif-1" } },
      }
    );
  });
});

describe("useMarkAllRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks all notifications as read", async () => {
    vi.mocked(api.POST).mockResolvedValue({
      data: { markedCount: 5 },
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAllRead(), { wrapper });

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.POST).toHaveBeenCalledWith("/api/v1/notifications/read-all");
    expect(result.current.data?.markedCount).toBe(5);
  });
});

describe("NOTIFICATION_TYPE_ICONS", () => {
  it("maps all notification types to emoji icons", () => {
    expect(NOTIFICATION_TYPE_ICONS).toEqual({
      TOPUP_COMPLETED: "💰",
      P2P_RECEIVED: "📩",
      BILL_PAID: "🧾",
      SECURITY_ALERT: "🔒",
    });
  });

  it("has exactly 4 type mappings", () => {
    expect(Object.keys(NOTIFICATION_TYPE_ICONS)).toHaveLength(4);
  });
});

describe("NOTIFICATION_TYPE_LABELS", () => {
  it("maps all notification types to Spanish labels", () => {
    expect(NOTIFICATION_TYPE_LABELS).toEqual({
      TOPUP_COMPLETED: "Recarga",
      P2P_RECEIVED: "Transferencia",
      BILL_PAID: "Pago de servicio",
      SECURITY_ALERT: "Alerta de seguridad",
    });
  });
});
