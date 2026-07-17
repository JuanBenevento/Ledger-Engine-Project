import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-wallets", () => ({
  useWallets: vi.fn(),
}));

vi.mock("@/lib/api/hooks/use-qr", () => ({
  useGenerateQr: vi.fn(),
}));

vi.mock("@/components/features/qr/qr-display", () => ({
  QRDisplay: ({ qrCodeId, amount }: { qrCodeId: string; amount?: number }) =>
    React.createElement(
      "div",
      { "data-testid": "qr-display" },
      `QRDisplay: qrCodeId=${qrCodeId}, amount=${amount ?? "open"}`
    ),
}));

import { useWallets } from "@/lib/api/hooks/use-wallets";
import { useGenerateQr } from "@/lib/api/hooks/use-qr";
import QRGeneratePage from "../page";

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

describe("QRGeneratePage", () => {
  const mockWallets = [
    { walletId: "wallet-1", name: "Mi Ahorro", currency: "COP", status: "ACTIVE" },
    { walletId: "wallet-2", name: "Gastos Diarios", currency: "COP", status: "ACTIVE" },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWallets).mockReturnValue({
      data: { wallets: mockWallets },
      isLoading: false,
    } as ReturnType<typeof useWallets>);
    vi.mocked(useGenerateQr).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as ReturnType<typeof useGenerateQr>);
  });

  it("renders page title", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByText("Generar código QR")).toBeInTheDocument();
  });

  it("renders page description", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByText("Crea un código QR para recibir pagos")).toBeInTheDocument();
  });

  it("renders amount input", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByLabelText("Monto (opcional)")).toBeInTheDocument();
  });

  it("renders wallet selector dropdown", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByText("Seleccionar billetera")).toBeInTheDocument();
  });

  it("renders generate button", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByText("Generar QR")).toBeInTheDocument();
  });

  it("generates QR when button is clicked with wallet selected", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });

    fireEvent.click(screen.getByText("Generar QR"));

    expect(mockMutate).toHaveBeenCalledWith({
      walletId: "wallet-1",
      amount: undefined,
      currency: "COP",
    });
  });

  it("generates QR with amount when provided", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });

    const amountInput = screen.getByLabelText("Monto (opcional)");
    fireEvent.change(amountInput, { target: { value: "50000" } });

    fireEvent.click(screen.getByText("Generar QR"));

    expect(mockMutate).toHaveBeenCalledWith({
      walletId: "wallet-1",
      amount: 50000,
      currency: "COP",
    });
  });

  it("shows QRDisplay after successful generation", () => {
    vi.mocked(useGenerateQr).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: true,
      data: {
        qrCodeId: "qr-123",
        qrImageBase64: "data:image/png;base64,abc",
        amount: "50000",
        currency: "COP",
        expiresAt: new Date(Date.now() + 900000).toISOString(),
      },
      reset: vi.fn(),
    } as ReturnType<typeof useGenerateQr>);

    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });

    expect(screen.getByTestId("qr-display")).toBeInTheDocument();
  });

  it("does not show QRDisplay before generation", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });

    expect(screen.queryByTestId("qr-display")).not.toBeInTheDocument();
  });

  it("shows amount hint text", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRGeneratePage), { wrapper });
    expect(screen.getByText("Déjalo vacío para un QR de monto abierto")).toBeInTheDocument();
  });
});
