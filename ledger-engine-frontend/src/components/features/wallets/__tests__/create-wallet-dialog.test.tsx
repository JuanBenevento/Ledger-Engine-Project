import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
  useCreateWallet: vi.fn(),
}));

// Import after mocking
import { useWallets, useCreateWallet } from "@/lib/api/hooks/use-wallets";
import { CreateWalletDialog } from "../create-wallet-dialog";

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

describe("CreateWalletDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with text", () => {
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: [] },
    } as ReturnType<typeof useWallets>);

    vi.mocked(useCreateWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateWallet>);

    const wrapper = createWrapper();
    render(React.createElement(CreateWalletDialog), { wrapper });

    expect(screen.getByText("Nueva billetera")).toBeInTheDocument();
  });

  it("disables button when at wallet limit (5 wallets)", () => {
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          { walletId: "1", name: "Wallet 1" },
          { walletId: "2", name: "Wallet 2" },
          { walletId: "3", name: "Wallet 3" },
          { walletId: "4", name: "Wallet 4" },
          { walletId: "5", name: "Wallet 5" },
        ],
      },
    } as ReturnType<typeof useWallets>);

    vi.mocked(useCreateWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateWallet>);

    const wrapper = createWrapper();
    render(React.createElement(CreateWalletDialog), { wrapper });

    const button = screen.getByRole("button", { name: /nueva billetera/i });
    expect(button).toBeDisabled();
  });

  it("enables button when under wallet limit", () => {
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          { walletId: "1", name: "Wallet 1" },
          { walletId: "2", name: "Wallet 2" },
        ],
      },
    } as ReturnType<typeof useWallets>);

    vi.mocked(useCreateWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateWallet>);

    const wrapper = createWrapper();
    render(React.createElement(CreateWalletDialog), { wrapper });

    const button = screen.getByRole("button", { name: /nueva billetera/i });
    expect(button).not.toBeDisabled();
  });
});
