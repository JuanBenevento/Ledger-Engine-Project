import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
}));

vi.mock("@/components/features/bills/biller-search", () => ({
  BillerSearch: ({ onSelect }: { onSelect: (biller: { id: string; name: string; category: string }) => void }) =>
    React.createElement(
      "div",
      { "data-testid": "biller-search" },
      React.createElement("button", {
        "data-testid": "select-biller",
        onClick: () => onSelect({ id: "biller-1", name: "EPM", category: "Energía" }),
      }, "Seleccionar facturador")
    ),
}));

vi.mock("@/components/features/bills/bill-favorites-list", () => ({
  BillFavoritesList: ({ onSelect }: { onSelect: (biller: { id: string; name: string; category: string }) => void }) =>
    React.createElement(
      "div",
      { "data-testid": "bill-favorites-list" },
      React.createElement("button", {
        "data-testid": "select-favorite",
        onClick: () => onSelect({ id: "biller-2", name: "Codensa", category: "Energía" }),
      }, "Seleccionar favorito")
    ),
}));

vi.mock("@/components/features/bills/bill-payment-form", () => ({
  BillPaymentForm: ({ billerId, walletId }: { billerId: string; walletId: string }) =>
    React.createElement(
      "div",
      { "data-testid": "bill-payment-form" },
      `BillPaymentForm: billerId=${billerId}, walletId=${walletId}`
    ),
}));

import { useWallets } from "@/lib/api/hooks/use-wallets";
import BillPaymentPage from "../page";

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

describe("BillPaymentPage", () => {
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
    render(React.createElement(BillPaymentPage), { wrapper });
    expect(screen.getByText("Pagar factura")).toBeInTheDocument();
  });

  it("renders biller search component", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });
    expect(screen.getByTestId("biller-search")).toBeInTheDocument();
  });

  it("renders favorites list component", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });
    expect(screen.getByTestId("bill-favorites-list")).toBeInTheDocument();
  });

  it("does not render payment form before biller selection", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });
    expect(screen.queryByTestId("bill-payment-form")).not.toBeInTheDocument();
  });

  it("renders payment form after selecting a biller", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });

    fireEvent.click(screen.getByTestId("select-biller"));

    expect(screen.getByTestId("bill-payment-form")).toBeInTheDocument();
    expect(screen.getByTestId("bill-payment-form")).toHaveTextContent("billerId=biller-1");
  });

  it("renders payment form after selecting a favorite", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });

    fireEvent.click(screen.getByTestId("select-favorite"));

    expect(screen.getByTestId("bill-payment-form")).toBeInTheDocument();
    expect(screen.getByTestId("bill-payment-form")).toHaveTextContent("billerId=biller-2");
  });

  it("passes active wallet id to payment form", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillPaymentPage), { wrapper });

    fireEvent.click(screen.getByTestId("select-biller"));

    expect(screen.getByTestId("bill-payment-form")).toHaveTextContent("walletId=wallet-1");
  });
});
