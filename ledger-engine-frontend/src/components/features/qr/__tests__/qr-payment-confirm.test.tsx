import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock usePayQr
const mockMutate = vi.fn();
const mockPayQr = {
  mutate: mockMutate,
  mutateAsync: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
};
vi.mock("@/lib/api/hooks/use-qr", () => ({
  usePayQr: () => mockPayQr,
}));

// Mock Dialog components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    React.createElement("div", { "data-testid": "dialog", "data-open": open }, children),
  DialogContent: ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-content" }, children),
  DialogHeader: ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-header" }, children),
  DialogTitle: ({ children }: any) =>
    React.createElement("h2", { "data-testid": "dialog-title" }, children),
  DialogDescription: ({ children }: any) =>
    React.createElement("p", { "data-testid": "dialog-description" }, children),
  DialogFooter: ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-footer" }, children),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) =>
    React.createElement("button", { "data-testid": "button", ...props }, children),
}));

// Mock formatCurrency
vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (v: number) => `$ ${v.toLocaleString()}`,
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { QRPaymentConfirm } from "../qr-payment-confirm";

describe("QRPaymentConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayQr.isPending = false;
    mockPayQr.isSuccess = false;
    mockPayQr.isError = false;
    mockPayQr.error = null;
    mockPayQr.data = undefined;
  });

  it("renders recipient name", () => {
    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("Carlos M.")).toBeInTheDocument();
  });

  it("renders amount formatted as COP", () => {
    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("$ 50,000")).toBeInTheDocument();
  });

  it("shows pay button", () => {
    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("Pagar")).toBeInTheDocument();
  });

  it("shows loading state during payment", () => {
    mockPayQr.isPending = true;

    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("Procesando pago...")).toBeInTheDocument();
  });

  it("shows success state after payment", () => {
    mockPayQr.isSuccess = true;
    mockPayQr.data = { paymentId: "payment-1", status: "COMPLETED" };

    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("¡Pago completado!")).toBeInTheDocument();
  });

  it("renders dialog title", () => {
    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("Confirmar pago QR")).toBeInTheDocument();
  });

  it("renders dialog description", () => {
    render(
      React.createElement(QRPaymentConfirm, {
        open: true,
        onClose: vi.fn(),
        recipientName: "Carlos M.",
        amount: 50000,
        qrCodeId: "qr-1",
        payerWalletId: "wallet-1",
        hmacPayload: "hmac-123",
      })
    );

    expect(screen.getByText("Revisa los datos antes de confirmar el pago")).toBeInTheDocument();
  });
});
