import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
  useCreateWallet: vi.fn(),
}));

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (value: number) => `$ ${value.toLocaleString()}`,
}));

vi.mock("@/components/features/topup/card-top-up-form", () => ({
  CardTopUpForm: ({ walletId, amount }: { walletId: string; amount: number }) =>
    React.createElement(
      "div",
      { "data-testid": "card-top-up-form" },
      `CardTopUpForm: walletId=${walletId}, amount=${amount}`
    ),
}));

vi.mock("@/components/features/topup/pse-bank-selector", () => ({
  PSEBankSelector: ({ walletId, amount }: { walletId: string; amount: number }) =>
    React.createElement(
      "div",
      { "data-testid": "pse-bank-selector" },
      `PSEBankSelector: walletId=${walletId}, amount=${amount}`
    ),
}));

vi.mock("@/components/features/topup/cash-top-up-result", () => ({
  CashTopUpResult: ({ walletId, amount }: { walletId: string; amount: number }) =>
    React.createElement(
      "div",
      { "data-testid": "cash-top-up-result" },
      `CashTopUpResult: walletId=${walletId}, amount=${amount}`
    ),
}));

import { useWallets, useCreateWallet } from "@/lib/api/hooks/use-wallets";
import TopUpPage from "../page";

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

describe("TopUpPage", () => {
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
    vi.mocked(useCreateWallet).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateWallet>);
  });

  it("renders page title", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });
    expect(screen.getByText("Recargar billetera")).toBeInTheDocument();
  });

  it("renders three method selector cards", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    expect(screen.getByText("Tarjeta")).toBeInTheDocument();
    expect(screen.getByText("PSE")).toBeInTheDocument();
    expect(screen.getByText("Efectivo")).toBeInTheDocument();
  });

  it("shows CardTopUpForm by default (Tarjeta method selected)", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    expect(screen.getByTestId("card-top-up-form")).toBeInTheDocument();
    expect(screen.queryByTestId("pse-bank-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cash-top-up-result")).not.toBeInTheDocument();
  });

  it("shows PSEBankSelector when PSE method is selected", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    fireEvent.click(screen.getByText("PSE"));

    expect(screen.getByTestId("pse-bank-selector")).toBeInTheDocument();
    expect(screen.queryByTestId("card-top-up-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cash-top-up-result")).not.toBeInTheDocument();
  });

  it("shows CashTopUpResult when Efectivo method is selected", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    fireEvent.click(screen.getByText("Efectivo"));

    expect(screen.getByTestId("cash-top-up-result")).toBeInTheDocument();
    expect(screen.queryByTestId("card-top-up-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pse-bank-selector")).not.toBeInTheDocument();
  });

  it("renders wallet selector dropdown", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    expect(screen.getByText("Seleccionar billetera")).toBeInTheDocument();
  });

  it("renders amount input", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    expect(screen.getByLabelText("Monto a recargar")).toBeInTheDocument();
  });

  it("passes selected wallet and amount to CardTopUpForm", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    const form = screen.getByTestId("card-top-up-form");
    expect(form).toHaveTextContent("walletId=wallet-1");
    expect(form).toHaveTextContent("amount=0");
  });

  it("updates amount when user types in input", () => {
    const wrapper = createWrapper();
    render(React.createElement(TopUpPage), { wrapper });

    const input = screen.getByLabelText("Monto a recargar");
    fireEvent.change(input, { target: { value: "50000" } });

    const form = screen.getByTestId("card-top-up-form");
    expect(form).toHaveTextContent("amount=50000");
  });
});
