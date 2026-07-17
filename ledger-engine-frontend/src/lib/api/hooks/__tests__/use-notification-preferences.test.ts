import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("../../client", () => ({
  default: {
    GET: vi.fn(),
    PUT: vi.fn(),
  },
}));

import api from "../../client";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../use-notification-preferences";

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

describe("useNotificationPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches preferences successfully", async () => {
    const mockData = {
      preferences: [
        { type: "TOPUP_COMPLETED", push: true, email: true, sms: false },
        { type: "P2P_RECEIVED", push: true, email: false, sms: false },
      ],
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockData, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.preferences).toHaveLength(2);
    expect(result.current.data?.preferences[0].type).toBe("TOPUP_COMPLETED");
    expect(result.current.data?.preferences[0].push).toBe(true);
  });

  it("calls the correct API endpoint", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: { preferences: [] },
      error: null,
    });

    const wrapper = createWrapper();
    renderHook(() => useNotificationPreferences(), { wrapper });

    await waitFor(() => {
      expect(api.GET).toHaveBeenCalledWith("/api/v1/notifications/preferences");
    });
  });
});

describe("useUpdateNotificationPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates preferences successfully", async () => {
    const mockResponse = {
      updated: [
        { type: "TOPUP_COMPLETED", push: false, email: true, sms: false },
      ],
    };

    vi.mocked(api.PUT).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper,
    });

    const newPreferences = [
      { type: "TOPUP_COMPLETED", push: false, email: true, sms: false },
    ];

    await result.current.mutateAsync(newPreferences);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.PUT).toHaveBeenCalledWith(
      "/api/v1/notifications/preferences",
      { body: { preferences: newPreferences } }
    );
    expect(result.current.data?.updated).toHaveLength(1);
  });
});