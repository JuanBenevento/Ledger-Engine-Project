import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
}));

vi.mock("@/components/features/transfer/recipient-search", () => ({
  RecipientSearch: ({ onSelect }: { onSelect: (recipient: { userId: string; name: string; email: string; avatar: string | null }) => void }) =>
    React.createElement(
      "div",
      { "data-testid": "recipient-search" },
      React.createElement("button", {
        "data-testid": "select-recipient",
        onClick: () => onSelect({ userId: "user-1", name: "Carlos M.", email: "carlos@test.com", avatar: null }),
      }, "Seleccionar destinatario")
    ),
}));

vi.mock("@/components/features/transfer/transfer-confirmation-dialog", () => ({
  TransferConfirmationDialog: ({ open, _onClose, recipient, amount, sourceWalletId, description }: {
    open: boolean;
    _onClose: () => void;
    recipient: { userId: string; name: string; email: string };
    amount: number;
    sourceWalletId: string;
    description: string;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "transfer-confirmation-dialog", "data-open": open },
      `TransferConfirmationDialog: recipient=${recipient.name}, amount=${amount}, wallet=${sourceWalletId}, desc=${description}`
    ),
}));

import { useWallets } from "@/lib/api/hooks/use-wallets";
import TransferPage from "../page";

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

describe("TransferPage", () => {
  const mockWallets = [
    { walletId: "wallet-1", name: "Mi Ahorro", currency: "COP", status: "ACTIVE" },
    { walletId: "wallet-2", name: "Gastos Diarios", currency: "COP", status: "ACTIVE" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: mockWallets },
      isLoading: false,
    } as ReturnType<typeof useWallets>);
  });

  it("renders page title", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByText("Transferir dinero")).toBeInTheDocument();
  });

  it("renders recipient search component", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByTestId("recipient-search")).toBeInTheDocument();
  });

  it("renders amount input", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByLabelText("Monto a transferir")).toBeInTheDocument();
  });

  it("renders wallet selector dropdown", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByText("Seleccionar billetera de origen")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByText("Continuar")).toBeInTheDocument();
  });

  it("disables submit button when no recipient selected", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    const button = screen.getByText("Continuar");
    expect(button).toBeDisabled();
  });

  it("enables submit button after selecting recipient and entering amount", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });

    fireEvent.click(screen.getByTestId("select-recipient"));

    const amountInput = screen.getByLabelText("Monto a transferir");
    fireEvent.change(amountInput, { target: { value: "50000" } });

    const button = screen.getByText("Continuar");
    expect(button).not.toBeDisabled();
  });

  it("opens confirmation dialog when form is submitted", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });

    fireEvent.click(screen.getByTestId("select-recipient"));

    const amountInput = screen.getByLabelText("Monto a transferir");
    fireEvent.change(amountInput, { target: { value: "50000" } });

    fireEvent.click(screen.getByText("Continuar"));

    const dialog = screen.getByTestId("transfer-confirmation-dialog");
    expect(dialog).toHaveAttribute("data-open", "true");
    expect(dialog).toHaveTextContent("recipient=Carlos M.");
    expect(dialog).toHaveTextContent("amount=50000");
  });

  it("shows minimum amount hint", () => {
    const wrapper = createWrapper();
    render(React.createElement(TransferPage), { wrapper });
    expect(screen.getByText("Mínimo $ 1.000 COP")).toBeInTheDocument();
  });
});
