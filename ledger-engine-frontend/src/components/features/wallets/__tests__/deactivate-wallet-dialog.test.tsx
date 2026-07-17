import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useDeactivateWallet: vi.fn(),
}));

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (v: number) => `$ ${v.toLocaleString()}`,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => React.createElement("div", { "data-testid": "dialog", "data-open": open }, children),
  DialogTrigger: ({ children, render }: any) => React.createElement("div", { "data-testid": "dialog-trigger" }, render || children),
  DialogContent: ({ children }: any) => React.createElement("div", { "data-testid": "dialog-content" }, children),
  DialogHeader: ({ children }: any) => React.createElement("div", { "data-testid": "dialog-header" }, children),
  DialogTitle: ({ children, className }: any) => React.createElement("h2", { "data-testid": "dialog-title", className }, children),
  DialogDescription: ({ children }: any) => React.createElement("p", { "data-testid": "dialog-description" }, children),
  DialogFooter: ({ children }: any) => React.createElement("div", { "data-testid": "dialog-footer" }, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, disabled, ...props }: any) =>
    React.createElement("button", { "data-testid": "button", "data-variant": variant, disabled, ...props }, children),
}));

import { useDeactivateWallet } from "@/lib/api/hooks/use-wallets";
import { DeactivateWalletDialog } from "../deactivate-wallet-dialog";

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const mockWallet = {
  walletId: "wallet-1",
  name: "Mi Ahorro",
  currency: "COP",
  status: "ACTIVE" as const,
};

describe("DeactivateWalletDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeactivateWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useDeactivateWallet>);
  });

  it("renders default trigger button with Desactivar text", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(DeactivateWalletDialog, { wallet: mockWallet }),
      { wrapper }
    );

    const trigger = screen.getByTestId("dialog-trigger");
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Desactivar")).toBeInTheDocument();
  });

  it("shows balance warning when balance > 0", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(DeactivateWalletDialog, { wallet: mockWallet, balance: 50000 }),
      { wrapper }
    );

    expect(screen.getByText("Saldo pendiente")).toBeInTheDocument();
    expect(screen.getByText(/Transfiere el saldo de/)).toBeInTheDocument();
  });

  it("disables deactivate button when balance > 0", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(DeactivateWalletDialog, { wallet: mockWallet, balance: 50000 }),
      { wrapper }
    );

    const deactivateButton = screen.getAllByText("Desactivar billetera").find(
      (el) => el.tagName === "BUTTON"
    );
    expect(deactivateButton).toBeDisabled();
  });

  it("shows wallet name in dialog description", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(DeactivateWalletDialog, { wallet: mockWallet }),
      { wrapper }
    );

    expect(screen.getByText(/Mi Ahorro/)).toBeInTheDocument();
  });
});