import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock the auth hook
vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: "user-1", email: "test@test.com" },
  })),
}));

// Mock the notification toast hook
vi.mock("@/hooks/use-notification-toast", () => ({
  useNotificationToast: vi.fn(),
}));

import { NotificationToastProvider } from "@/components/atoms/notification-toast-provider";
import { useNotificationToast } from "@/hooks/use-notification-toast";
import { useAuth } from "@/lib/auth";

describe("NotificationToastProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup default mock after clearAllMocks
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@test.com" },
    });
  });

  it("renders children", () => {
    render(
      <NotificationToastProvider>
        <div data-testid="child">Child content</div>
      </NotificationToastProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("calls useNotificationToast with user ID", () => {
    render(
      <NotificationToastProvider>
        <div>Child</div>
      </NotificationToastProvider>
    );

    expect(useNotificationToast).toHaveBeenCalledWith("user-1");
  });

  it("calls useNotificationToast with empty string when no user", () => {
    // Override mock to return no user
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
    } as any);

    render(
      <NotificationToastProvider>
        <div>Child</div>
      </NotificationToastProvider>
    );

    expect(useNotificationToast).toHaveBeenCalledWith("");
  });
});