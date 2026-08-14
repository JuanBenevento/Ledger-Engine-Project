import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "wallet-1" }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, "data-testid": "link" }, children),
}));

// Mock hooks
vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
  useWalletBalance: vi.fn(),
  useWalletTransactions: vi.fn(),
  useRenameWallet: vi.fn(),
}));

// Mock child components
vi.mock("@/components/features/wallets/transaction-history", () => ({
  TransactionHistory: ({ transactions, isLoading, hasMore, _onLoadMore }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "transaction-history",
        "data-transactions": JSON.stringify(transactions),
        "data-isloading": String(isLoading),
        "data-hasmore": String(hasMore),
      },
      "Transaction History"
    ),
}));

vi.mock("@/components/features/wallets/deactivate-wallet-dialog", () => ({
  DeactivateWalletDialog: ({ wallet, _balance, children }: any) =>
    React.createElement(
      "div",
      { "data-testid": "deactivate-wallet-dialog", "data-walletid": wallet?.wallet_id },
      children
    ),
}));

// Mock DropdownMenu to always render content (for testing nested components)
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dropdown-menu" }, children),
  DropdownMenuTrigger: ({ children }: any) =>
    React.createElement("div", { "data-testid": "dropdown-menu-trigger" }, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dropdown-menu-content" }, children),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dropdown-menu-item" }, children),
  DropdownMenuSeparator: () => React.createElement("hr", { "data-testid": "dropdown-menu-separator" }),
}));

// Mock AnimatedNumber and formatCurrency
vi.mock("@/hooks/use-currency", () => ({
  AnimatedNumber: ({ value }: { value: number }) =>
    React.createElement("span", { "data-testid": "animated-number" }, `$ ${value}`),
  formatCurrency: (v: number) => `$ ${v.toLocaleString()}`,
}));

// Mock Badge
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    React.createElement(
      "span",
      { "data-testid": "badge", "data-variant": variant },
      children
    ),
}));

// Mock Skeleton — uses data-slot like the real component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Import after mocking
import {
  useWallets,
  useWalletBalance,
  useWalletTransactions,
  useRenameWallet,
} from "@/lib/api/hooks/use-wallets";
import WalletDetailPage from "../page";

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

describe("WalletDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when data is loading", () => {
    vi.mocked(useWallets).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows 'Billetera no encontrada' when wallet not found", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: [] },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { balance: "0", currency: "COP" },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Billetera no encontrada")).toBeInTheDocument();
    });
  });

  it("renders wallet name and status badge when wallet found", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          {
            walletId: "wallet-1",
            name: "Mi Ahorro",
            currency: "COP",
            status: "ACTIVE",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { balance: "1250000", currency: "COP" },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: { content: [] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Mi Ahorro")).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const activaBadge = badges.find(
        (b) => b.textContent === "Activa"
      );
      expect(activaBadge).toBeDefined();
    });
  });

  it("renders balance with AnimatedNumber", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          {
            walletId: "wallet-1",
            name: "Mi Ahorro",
            currency: "COP",
            status: "ACTIVE",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { balance: "1250000", currency: "COP" },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: { content: [] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    await waitFor(() => {
      const animatedNumber = screen.getByTestId("animated-number");
      expect(animatedNumber).toBeInTheDocument();
      expect(animatedNumber.textContent).toContain("1250000");
    });
  });

  it("renders TransactionHistory component with correct props", async () => {
    const mockTransactions = [
      { transactionId: "t1", amount: 50000, type: "INCOME", description: "Salario" },
    ];

    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          {
            walletId: "wallet-1",
            name: "Mi Ahorro",
            currency: "COP",
            status: "ACTIVE",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { balance: "1250000", currency: "COP" },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: { content: mockTransactions },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    await waitFor(() => {
      const transactionHistory = screen.getByTestId("transaction-history");
      expect(transactionHistory).toBeInTheDocument();
      expect(
        JSON.parse(transactionHistory.getAttribute("data-transactions") || "[]")
      ).toHaveLength(1);
    });
  });

  it("renders DeactivateWalletDialog component", async () => {
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          {
            walletId: "wallet-1",
            name: "Mi Ahorro",
            currency: "COP",
            status: "ACTIVE",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletBalance).mockReturnValue({
      data: { balance: "1250000", currency: "COP" },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useWalletTransactions).mockReturnValue({
      data: { content: [] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as any);

    vi.mocked(useRenameWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    const wrapper = createWrapper();
    render(React.createElement(WalletDetailPage), { wrapper });

    await waitFor(() => {
      const deactivateDialog = screen.getByTestId("deactivate-wallet-dialog");
      expect(deactivateDialog).toBeInTheDocument();
      expect(deactivateDialog.getAttribute("data-walletid")).toBe("wallet-1");
    });
  });
});
