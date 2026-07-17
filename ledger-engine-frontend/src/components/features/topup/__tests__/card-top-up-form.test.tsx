import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-topups", () => ({
  useCardTopUp: vi.fn(),
}));

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (value: number) =>
    `$ ${value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
}));

import { useCardTopUp } from "@/lib/api/hooks/use-topups";
import { CardTopUpForm } from "../card-top-up-form";

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

describe("CardTopUpForm", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCardTopUp).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCardTopUp>);
  });

  it("renders card number input", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    expect(screen.getByLabelText("Número de tarjeta")).toBeInTheDocument();
  });

  it("renders expiry date input", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    expect(screen.getByLabelText("Fecha de expiración")).toBeInTheDocument();
  });

  it("renders CVV input with password type", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    const cvvInput = screen.getByLabelText("CVV");
    expect(cvvInput).toBeInTheDocument();
    expect(cvvInput).toHaveAttribute("type", "password");
  });

  it("renders amount display", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    expect(screen.getByText("Monto a recargar")).toBeInTheDocument();
    expect(screen.getByText("$ 50.000")).toBeInTheDocument();
  });

  it("renders submit button with text 'Recargar'", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    expect(screen.getByRole("button", { name: /recargar/i })).toBeInTheDocument();
  });

  it("calls mutation on form submit", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    fireEvent.change(screen.getByLabelText("Número de tarjeta"), {
      target: { value: "4111111111111111" },
    });
    fireEvent.change(screen.getByLabelText("Fecha de expiración"), {
      target: { value: "12/28" },
    });
    fireEvent.change(screen.getByLabelText("CVV"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /recargar/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      walletId: "wallet-1",
      data: {
        amount: "50000",
        currency: "COP",
        cardToken: "4111111111111111",
      },
    });
  });

  it("shows loading state when submitting", () => {
    vi.mocked(useCardTopUp).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCardTopUp>);

    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    const button = screen.getByRole("button", { name: /recargando/i });
    expect(button).toBeDisabled();
  });

  it("formats card number with spaces", () => {
    const wrapper = createWrapper();
    render(
      React.createElement(CardTopUpForm, {
        walletId: "wallet-1",
        amount: 50000,
      }),
      { wrapper }
    );

    const input = screen.getByLabelText("Número de tarjeta");
    fireEvent.change(input, { target: { value: "4111111111111111" } });

    expect(input).toHaveValue("4111 1111 1111 1111");
  });
});
