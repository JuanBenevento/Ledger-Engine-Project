import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (value: number) => {
    const formatted = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return formatted.replace("$\u00a0", "$ ");
  },
}));

import { QRDisplay } from "../qr-display";

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

describe("QRDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    qrCodeId: "qr-123",
    qrImageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
    amount: 50000,
    currency: "COP",
    expiresAt: new Date(Date.now() + 900000).toISOString(), // 15 min from now
  };

  it("renders QR image with correct src", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    const img = screen.getByRole("img", { name: /código qr/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", baseProps.qrImageBase64);
  });

  it("renders success message", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    expect(screen.getByText("QR generado exitosamente")).toBeInTheDocument();
  });

  it("displays formatted amount", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    expect(screen.getByText("$ 50.000")).toBeInTheDocument();
  });

  it("renders countdown timer showing remaining time", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    expect(screen.getByText(/Tiempo restante/)).toBeInTheDocument();
  });

  it("renders download button", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    expect(screen.getByText("Descargar QR")).toBeInTheDocument();
  });

  it("renders share button", () => {
    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    expect(screen.getByText("Compartir")).toBeInTheDocument();
  });

  it("shows expiry warning when less than 2 minutes remaining", () => {
    const wrapper = createWrapper();
    // Set expiresAt to 90 seconds from now (less than 2 minutes)
    const props = {
      ...baseProps,
      expiresAt: new Date(Date.now() + 90000).toISOString(),
    };

    render(React.createElement(QRDisplay, props), { wrapper });

    expect(screen.getByText("El QR expira pronto")).toBeInTheDocument();
  });

  it("does not show expiry warning when more than 2 minutes remaining", () => {
    const wrapper = createWrapper();
    // Set expiresAt to 15 minutes from now
    const props = {
      ...baseProps,
      expiresAt: new Date(Date.now() + 900000).toISOString(),
    };

    render(React.createElement(QRDisplay, props), { wrapper });

    expect(screen.queryByText("El QR expira pronto")).not.toBeInTheDocument();
  });

  it("calls navigator.share when share button clicked", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
    });

    const wrapper = createWrapper();
    render(React.createElement(QRDisplay, baseProps), { wrapper });

    await act(async () => {
      fireEvent.click(screen.getByText("Compartir"));
    });

    expect(mockShare).toHaveBeenCalled();
  });

  it("renders without amount for dynamic QR", () => {
    const wrapper = createWrapper();
    const props = {
      qrCodeId: "qr-456",
      qrImageBase64: "data:image/png;base64,abc123",
      expiresAt: new Date(Date.now() + 900000).toISOString(),
    };

    render(React.createElement(QRDisplay, props), { wrapper });

    expect(screen.getByText("QR generado exitosamente")).toBeInTheDocument();
    expect(screen.queryByText("$ 0")).not.toBeInTheDocument();
  });
});
