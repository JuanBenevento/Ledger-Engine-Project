import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
}));

vi.mock("@/lib/api/hooks/use-bills", () => ({
  usePayBill: vi.fn(),
}));

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (value: number) =>
    `$ ${value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
}));

vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => React.createElement("input", { ...props, ref, "data-testid": "input" })
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void }) =>
    React.createElement("div", { "data-testid": "select" }, children),
  SelectTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-trigger" }, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) =>
    React.createElement("span", { "data-testid": "select-value" }, placeholder),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select-content" }, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-testid": "select-item", "data-value": value }, children),
}));

import { useWallets } from "@/lib/api/hooks/use-wallets";
import { usePayBill } from "@/lib/api/hooks/use-bills";
import { BillPaymentForm } from "../bill-payment-form";

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

describe("BillPaymentForm", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWallets).mockReturnValue({
      data: {
        wallets: [
          { walletId: "wallet-1", name: "Mi Ahorro", currency: "COP", status: "ACTIVE" },
          { walletId: "wallet-2", name: "Gastos Diarios", currency: "COP", status: "ACTIVE" },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useWallets>);

    vi.mocked(usePayBill).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
    } as ReturnType<typeof usePayBill>);
  });

  it("renders reference number input", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    expect(screen.getByLabelText("Número de referencia")).toBeInTheDocument();
  });

  it("renders amount input", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    expect(screen.getByLabelText("Monto a pagar")).toBeInTheDocument();
  });

  it("renders wallet selector", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    const selectors = screen.getAllByText("Seleccionar billetera");
    expect(selectors.length).toBeGreaterThanOrEqual(1);
  });

  it("renders submit button", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows minimum amount hint", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    expect(screen.getByText("Mínimo $ 1.000 COP")).toBeInTheDocument();
  });

  it("calls mutation on form submit with correct data", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    fireEvent.change(screen.getByLabelText("Número de referencia"), {
      target: { value: "123456789" },
    });

    fireEvent.change(screen.getByLabelText("Monto a pagar"), {
      target: { value: "50000" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      billerId: "biller-1",
      walletId: "wallet-1",
      amount: 50000,
      reference: "123456789",
    });
  });

  it("disables submit button when amount is 0", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    const button = screen.getByRole("button", { name: /continuar/i });
    expect(button).toBeDisabled();
  });

  it("shows loading state when submitting", () => {
    vi.mocked(usePayBill).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
    } as ReturnType<typeof usePayBill>);

    const wrapper = createWrapper();
    render(
      React.createElement(BillPaymentForm, {
        billerId: "biller-1",
        walletId: "wallet-1",
      }),
      { wrapper }
    );

    const button = screen.getByRole("button", { name: /procesando/i });
    expect(button).toBeDisabled();
  });
});
