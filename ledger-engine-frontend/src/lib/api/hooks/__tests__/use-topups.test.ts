import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("../../client", () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
import api from "../../client";
import { useCashTopUp, useConfirmCashTopUp } from "../use-topups";

// Create a test wrapper with QueryClientProvider
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

describe("useCashTopUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initiates cash top-up successfully", async () => {
    const mockResponse = {
      topUpId: "topup-cash-new",
      referenceNumber: "REF-12345678",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      status: "PENDING",
    };

    vi.mocked(api.POST).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCashTopUp(), { wrapper });

    await result.current.mutateAsync({
      walletId: "wallet-1",
      amount: 50000,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.POST).toHaveBeenCalledWith(
      "/api/v1/wallets/{walletId}/topup/cash",
      {
        params: { path: { walletId: "wallet-1" } },
        body: { amount: "50000", currency: "COP" },
      }
    );
  });

  it("handles error state", async () => {
    vi.mocked(api.POST).mockResolvedValue({
      data: null,
      error: { message: "Insufficient funds" },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCashTopUp(), { wrapper });

    await expect(
      result.current.mutateAsync({
        walletId: "wallet-1",
        amount: 50000,
      })
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("useConfirmCashTopUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms cash top-up successfully", async () => {
    const mockResponse = {
      topUpId: "topup-123",
      status: "COMPLETED",
    };

    vi.mocked(api.POST).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfirmCashTopUp(), { wrapper });

    await result.current.mutateAsync("topup-123");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.POST).toHaveBeenCalledWith(
      "/api/v1/topups/{topUpId}/confirm",
      {
        params: { path: { topUpId: "topup-123" } },
      }
    );
  });

  it("handles error state", async () => {
    vi.mocked(api.POST).mockResolvedValue({
      data: null,
      error: { message: "Top-up not found" },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfirmCashTopUp(), { wrapper });

    await expect(
      result.current.mutateAsync("topup-123")
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
