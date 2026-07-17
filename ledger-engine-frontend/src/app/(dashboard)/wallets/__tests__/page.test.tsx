import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
  useWalletBalance: vi.fn(),
}));

// Mock the WalletCard component
vi.mock("@/components/features/wallets/wallet-card", () => ({
  WalletCard: ({ wallet, balance }: { wallet: { name: string }; balance: number }) =>
    React.createElement(
      "div",
      { "data-testid": "wallet-card", "data-name": wallet.name, "data-balance": balance },
      `Wallet: ${wallet.name}`
    ),
}));

// Mock the CreateWalletDialog component
vi.mock("@/components/features/wallets/create-wallet-dialog", () => ({
  CreateWalletDialog: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(
      "button",
      { "data-testid": "create-wallet-dialog" },
      children || "Nueva billetera"
    ),
}));

// Mock the AnimatedNumber component
vi.mock("@/hooks/use-currency", () => ({
  AnimatedNumber: ({ value }: { value: number }) =>
    React.createElement("span", { "data-testid": "animated-number" }, `$ ${value}`),
  formatCurrency: (value: number) => `$ ${value.toLocaleString()}`,
}));

// Import after mocking
import { useWallets, useWalletBalance } from "@/lib/api/hooks/use-wallets";
import DashboardPage from "../page";

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

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    vi.mocked(useWallets).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useWallets>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    // Should show skeleton loader
    expect(screen.getByText("Mis Billeteras")).toBeInTheDocument();
    expect(screen.getByText("Administra tus finanzas de forma simple y segura")).toBeInTheDocument();
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error state", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    } as ReturnType<typeof useWallets>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar las billeteras/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no wallets", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useWallets>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText("No tienes billeteras aún")).toBeInTheDocument();
      expect(screen.getByText(/Crea tu primera billetera virtual/)).toBeInTheDocument();
    });
  });

  it("shows wallet grid when wallets exist", async () => {
    const mockWallets = [
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
    ];

    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: mockWallets },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useWallets>);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { available: 1250000, currency: "COP" },
    } as ReturnType<typeof useWalletBalance>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Mis Billeteras")).toBeInTheDocument();
      expect(screen.getAllByTestId("wallet-card")).toHaveLength(2);
    });
  });

  it("displays total balance hero", async () => {
    const mockWallets = [
      {
        walletId: "wallet-1",
        name: "Mi Ahorro",
        currency: "COP",
        status: "ACTIVE",
        createdAt: "2026-01-15T10:00:00Z",
      },
    ];

    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: mockWallets },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useWallets>);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { available: 1250000, currency: "COP" },
    } as ReturnType<typeof useWalletBalance>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Saldo total")).toBeInTheDocument();
    });
  });

  it("shows create wallet button", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useWallets>);

    const wrapper = createWrapper();
    render(React.createElement(DashboardPage), { wrapper });

    await waitFor(() => {
      const buttons = screen.getAllByTestId("create-wallet-dialog");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
