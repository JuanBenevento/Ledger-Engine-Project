import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-transfers", () => ({
  useTransfer: vi.fn(),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? React.createElement("div", { "data-testid": "dialog", role: "dialog" }, children) : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { "data-testid": "dialog-content", className }, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog-header" }, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", { "data-testid": "dialog-title" }, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("p", { "data-testid": "dialog-description" }, children),
  DialogFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog-footer" }, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
  }) =>
    React.createElement("button", { onClick, disabled, "data-variant": variant, className }, children),
}));

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (value: number) => `$ ${value.toLocaleString("es-CO")}`,
}));

import { useTransfer } from "@/lib/api/hooks/use-transfers";
import { TransferConfirmationDialog } from "../transfer-confirmation-dialog";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe("TransferConfirmationDialog", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTransfer).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as ReturnType<typeof useTransfer>);
  });

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    recipient: { userId: "user-1", name: "Carlos M.", email: "carlos@test.com" },
    amount: 50000,
    sourceWalletId: "wallet-1",
    description: "Pago de almuerzo",
  };

  it("renders recipient name", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText("Carlos M.")).toBeInTheDocument();
  });

  it("renders formatted amount", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText(/\$ 50\.000/)).toBeInTheDocument();
  });

  it("renders description", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText("Pago de almuerzo")).toBeInTheDocument();
  });

  it("renders dialog title", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText("Confirmar transferencia")).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("calls mutate when confirm button is clicked", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });

    fireEvent.click(screen.getByText("Confirmar"));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "carlos@test.com",
        amount: 50000,
        walletId: "wallet-1",
        description: "Pago de almuerzo",
      }),
      expect.any(Object)
    );
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    const wrapper = createWrapper();
    render(
      React.createElement(TransferConfirmationDialog, { ...defaultProps, onClose }),
      { wrapper }
    );

    fireEvent.click(screen.getByText("Cancelar"));

    expect(onClose).toHaveBeenCalled();
  });

  it("shows loading state during transfer", () => {
    vi.mocked(useTransfer).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as ReturnType<typeof useTransfer>);

    const wrapper = createWrapper();
    render(React.createElement(TransferConfirmationDialog, defaultProps), { wrapper });

    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    expect(screen.getByText("Enviando...")).toBeDisabled();
  });

  it("does not render when open is false", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(TransferConfirmationDialog, { ...defaultProps, open: false }),
      { wrapper }
    );

    expect(screen.queryByText("Confirmar transferencia")).not.toBeInTheDocument();
  });
});
