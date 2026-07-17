import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock ably module
vi.mock("@/lib/ably", () => ({
  createNotificationChannel: vi.fn(),
}));

import { toast } from "sonner";
import { createNotificationChannel } from "@/lib/ably";
import { useNotificationToast, getNotificationRoute, NOTIFICATION_ROUTES } from "../use-notification-toast";
import type { NotificationEvent, NotificationType } from "@/lib/ably";

// Helper to create a mock notification event
function createMockEvent(overrides: Partial<NotificationEvent> = {}): NotificationEvent {
  return {
    notificationId: "notif-1",
    userId: "user-1",
    type: "P2P_RECEIVED",
    title: "Transferencia recibida",
    message: "Carlos te envió $50.000",
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("useNotificationToast", () => {
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let capturedCallback: ((event: NotificationEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup mock channel
    mockSubscribe = vi.fn((callback) => {
      capturedCallback = callback;
    });
    mockUnsubscribe = vi.fn();
    mockDisconnect = vi.fn();

    vi.mocked(createNotificationChannel).mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      disconnect: mockDisconnect,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("subscribes to notification channel on mount", () => {
    renderHook(() => useNotificationToast("user-1"));

    expect(createNotificationChannel).toHaveBeenCalledWith("user-1");
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it("shows toast when notification event is received", () => {
    renderHook(() => useNotificationToast("user-1"));

    const event = createMockEvent();
    act(() => {
      capturedCallback?.(event);
    });

    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Transferencia recibida"),
      expect.objectContaining({
        duration: 5000,
      })
    );
  });

  it("auto-dismisses toast after 5 seconds", () => {
    renderHook(() => useNotificationToast("user-1"));

    const event = createMockEvent();
    act(() => {
      capturedCallback?.(event);
    });

    expect(toast.success).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ duration: 5000 })
    );
  });

  it("batches more than 10 notifications within 1 second", () => {
    renderHook(() => useNotificationToast("user-1"));

    // Send 11 notifications within 1 second
    for (let i = 0; i < 11; i++) {
      const event = createMockEvent({ notificationId: `notif-${i}` });
      act(() => {
        capturedCallback?.(event);
      });
    }

    // Advance time to trigger batch timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should show a batch toast with count 11
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("11"),
      expect.objectContaining({ duration: 5000 })
    );
  });

  it("shows individual toasts for fewer than 10 notifications within 1 second", () => {
    renderHook(() => useNotificationToast("user-1"));

    const event1 = createMockEvent({ notificationId: "notif-1" });
    const event2 = createMockEvent({ notificationId: "notif-2" });

    act(() => {
      capturedCallback?.(event1);
    });
    act(() => {
      capturedCallback?.(event2);
    });

    // Should show individual toasts (no batch)
    expect(toast.success).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Transferencia recibida"),
      expect.objectContaining({ duration: 5000 })
    );
  });

  it("unsubscribes from channel on unmount", () => {
    const { unmount } = renderHook(() => useNotificationToast("user-1"));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("includes action with correct route for P2P_RECEIVED notification", () => {
    renderHook(() => useNotificationToast("user-1"));

    const event = createMockEvent({ type: "P2P_RECEIVED" });
    act(() => {
      capturedCallback?.(event);
    });

    // Verify toast was called with action that has label "Ver"
    const toastCall = vi.mocked(toast.success).mock.calls[0];
    const action = toastCall[1]?.action as { label: string; onClick: () => void };
    expect(action).toBeDefined();
    expect(action.label).toBe("Ver");
    expect(action.onClick).toBeInstanceOf(Function);
  });
});

describe("getNotificationRoute", () => {
  it("maps TOPUP_COMPLETED to /topup", () => {
    expect(getNotificationRoute("TOPUP_COMPLETED")).toBe("/topup");
  });

  it("maps P2P_RECEIVED to /transfer", () => {
    expect(getNotificationRoute("P2P_RECEIVED")).toBe("/transfer");
  });

  it("maps BILL_PAID to /bills", () => {
    expect(getNotificationRoute("BILL_PAID")).toBe("/bills");
  });

  it("maps SECURITY_ALERT to /security", () => {
    expect(getNotificationRoute("SECURITY_ALERT")).toBe("/security");
  });

  it("falls back to /notifications for unknown type", () => {
    expect(getNotificationRoute("UNKNOWN_TYPE" as NotificationType)).toBe("/notifications");
  });
});