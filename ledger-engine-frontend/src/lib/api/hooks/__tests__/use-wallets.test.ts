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

// Import after mocking
import api from "../../client";
import {
  useWallets,
  useWalletBalance,
  useCreateWallet,
  useRenameWallet,
  useDeactivateWallet,
  useWalletTransactions,
} from "../use-wallets";

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

describe("useWallets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches wallets successfully", async () => {
    const mockData = {
      wallets: [
        {
          walletId: "wallet-1",
          name: "Mi Ahorro",
          currency: "COP",
          status: "ACTIVE",
          createdAt: "2026-01-15T10:00:00Z",
        },
        {
          walletId: "wallet-2",
          name: "Gastos Diarios",
          currency: "COP",
          status: "ACTIVE",
          createdAt: "2026-02-20T14:30:00Z",
        },
      ],
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockData, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWallets(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.wallets).toHaveLength(2);
    expect(result.current.data?.wallets[0].name).toBe("Mi Ahorro");
    expect(api.GET).toHaveBeenCalledWith("/api/v1/wallets");
  });

  it("handles loading state", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useWallets(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles error state", async () => {
    vi.mocked(api.GET).mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWallets(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("useWalletBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches balance for a wallet", async () => {
    const mockData = {
      available: 1250000,
      pending: 50000,
      currency: "COP",
      lastUpdated: new Date().toISOString(),
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockData, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWalletBalance("wallet-1"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.available).toBe(1250000);
    expect(result.current.data?.currency).toBe("COP");
    expect(api.GET).toHaveBeenCalledWith("/api/v1/wallets/{walletId}/balance", {
      params: { path: { walletId: "wallet-1" } },
    });
  });

  it("does not fetch when walletId is null", () => {
    vi.mocked(api.GET).mockResolvedValue({ data: null, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWalletBalance(null), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.GET).not.toHaveBeenCalled();
  });
});

describe("useCreateWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a wallet successfully", async () => {
    const mockResponse = {
      walletId: "wallet-new",
      name: "Nueva Billetera",
      currency: "COP",
      status: "ACTIVE",
    };

    vi.mocked(api.POST).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateWallet(), { wrapper });

    await result.current.mutateAsync({
      name: "Nueva Billetera",
      currency: "COP",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.POST).toHaveBeenCalledWith("/api/v1/wallets", {
      body: { name: "Nueva Billetera", currency: "COP" },
    });
  });
});

describe("useRenameWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renames a wallet successfully", async () => {
    const mockResponse = {
      walletId: "wallet-1",
      name: "Nuevo Nombre",
    };

    vi.mocked(api.PATCH).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useRenameWallet(), { wrapper });

    await result.current.mutateAsync({
      walletId: "wallet-1",
      name: "Nuevo Nombre",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.PATCH).toHaveBeenCalledWith("/api/v1/wallets/{walletId}", {
      params: { path: { walletId: "wallet-1" } },
      body: { name: "Nuevo Nombre" },
    });
  });
});

describe("useDeactivateWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deactivates a wallet successfully", async () => {
    const mockResponse = { status: "INACTIVE" };

    vi.mocked(api.POST).mockResolvedValue({ data: mockResponse, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeactivateWallet(), { wrapper });

    await result.current.mutateAsync("wallet-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.POST).toHaveBeenCalledWith(
      "/api/v1/wallets/{walletId}/deactivate",
      {
        params: { path: { walletId: "wallet-1" } },
      }
    );
  });
});

describe("useWalletTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches transactions for a wallet", async () => {
    const mockData = {
      content: [
        {
          transactionId: "txn-1",
          type: "DEPOSIT",
          amount: 100000,
          currency: "COP",
          status: "COMPLETED",
          description: "Recarga PSE",
          createdAt: new Date().toISOString(),
        },
        {
          transactionId: "txn-2",
          type: "TRANSFER",
          amount: -50000,
          currency: "COP",
          status: "COMPLETED",
          description: "Transferencia a Carlos",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      pagination: {
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      },
    };

    vi.mocked(api.GET).mockResolvedValue({ data: mockData, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useWalletTransactions("wallet-1", 0, 20),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.content).toHaveLength(2);
    expect(api.GET).toHaveBeenCalledWith(
      "/api/v1/wallets/{walletId}/transactions",
      {
        params: {
          path: { walletId: "wallet-1" },
          query: { page: 0, size: 20 },
        },
      }
    );
  });

  it("does not fetch when walletId is null", () => {
    vi.mocked(api.GET).mockResolvedValue({ data: null, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useWalletTransactions(null, 0, 20),
      { wrapper }
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.GET).not.toHaveBeenCalled();
  });
});
