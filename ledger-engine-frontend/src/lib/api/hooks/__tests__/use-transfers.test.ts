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
import { useTransferHistory } from "../use-transfers";

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

describe("useTransferHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches transfers successfully", async () => {
    const mockResponse = {
      content: [
        {
          transferId: "txn-1",
          type: "TRANSFER",
          amount: 50000,
          currency: "COP",
          status: "COMPLETED",
          description: "Transferencia a Carlos",
          createdAt: new Date().toISOString(),
          counterparty: { name: "Carlos M." },
          direction: "SENT",
        },
      ],
      pagination: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTransferHistory("wallet-1", 0, 20), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.GET).toHaveBeenCalledWith("/api/v1/p2p/transfers", {
      params: { query: { page: 0, size: 20 } },
    });
  });

  it("does not fetch when walletId is null", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTransferHistory(null), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(api.GET).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: null,
      error: { message: "Transfers not found" },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTransferHistory("wallet-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
