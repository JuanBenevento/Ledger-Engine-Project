import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock formatCurrency
vi.mock("@/hooks/use-currency", () => ({
  formatCurrency: (v: number) => `$ ${v.toLocaleString()}`,
}));

// Mock Badge
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    React.createElement("span", { "data-testid": "badge", "data-variant": variant }, children),
}));

// Mock Card
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) =>
    React.createElement("div", { "data-testid": "card", className }, children),
  CardContent: ({ children }: any) =>
    React.createElement("div", { "data-testid": "card-content" }, children),
  CardHeader: ({ children }: any) =>
    React.createElement("div", { "data-testid": "card-header" }, children),
  CardTitle: ({ children }: any) =>
    React.createElement("h3", { "data-testid": "card-title" }, children),
}));

// Mock Skeleton — uses data-slot like the real component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Mock Tabs
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) =>
    React.createElement("div", { "data-testid": "tabs", "data-default-value": defaultValue }, children),
  TabsList: ({ children }: any) =>
    React.createElement("div", { "data-testid": "tabs-list" }, children),
  TabsTrigger: ({ children, value, ...props }: any) =>
    React.createElement("button", { "data-testid": "tabs-trigger", "data-value": value, ...props }, children),
  TabsContent: ({ children, value, ...props }: any) =>
    React.createElement("div", { "data-testid": "tabs-content", "data-value": value, ...props }, children),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { QRPaymentHistory } from "../qr-payment-history";

function createQrPayment(overrides: Partial<Record<string, any>> = {}) {
  return {
    paymentId: "qr-pay-1",
    amount: 50000,
    currency: "COP",
    recipientName: "Carlos M.",
    status: "COMPLETED",
    type: "SENT",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("QRPaymentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no payments", () => {
    render(React.createElement(QRPaymentHistory, { payments: [] }));

    expect(screen.getByText("No hay pagos QR")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading and no payments", () => {
    render(React.createElement(QRPaymentHistory, { payments: [], isLoading: true }));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders a sent payment with correct amount", () => {
    const payment = createQrPayment({ type: "SENT", amount: 50000, recipientName: "Carlos M." });
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    expect(screen.getByText("Carlos M.")).toBeInTheDocument();
    expect(screen.getByText("- $ 50,000")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Historial de pagos QR");
  });

  it("renders a received payment with correct amount", () => {
    const payment = createQrPayment({ type: "RECEIVED", amount: 100000, recipientName: "María G." });
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    expect(screen.getByText("María G.")).toBeInTheDocument();
    expect(screen.getByText("+ $ 100,000")).toBeInTheDocument();
  });

  it("shows status badge with correct variant (COMPLETED=default)", () => {
    const payment = createQrPayment({ status: "COMPLETED" });
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    const badges = screen.getAllByTestId("badge");
    const statusBadge = badges.find((b) => b.textContent === "Completado");
    expect(statusBadge).toBeTruthy();
    expect(statusBadge).toHaveAttribute("data-variant", "default");
  });

  it("shows status badge with correct variant (PENDING=secondary)", () => {
    const payment = createQrPayment({ status: "PENDING" });
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    const badges = screen.getAllByTestId("badge");
    const statusBadge = badges.find((b) => b.textContent === "Pendiente");
    expect(statusBadge).toBeTruthy();
    expect(statusBadge).toHaveAttribute("data-variant", "secondary");
  });

  it("shows status badge with correct variant (FAILED=destructive)", () => {
    const payment = createQrPayment({ status: "FAILED" });
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    const badges = screen.getAllByTestId("badge");
    const statusBadge = badges.find((b) => b.textContent === "Fallido");
    expect(statusBadge).toBeTruthy();
    expect(statusBadge).toHaveAttribute("data-variant", "destructive");
  });

  it("displays tabs with Enviados and Recibidos when payments exist", () => {
    const payment = createQrPayment();
    render(React.createElement(QRPaymentHistory, { payments: [payment] }));

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByText("Enviados")).toBeInTheDocument();
    expect(screen.getByText("Recibidos")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", () => {
    const payment = createQrPayment();
    render(
      React.createElement(QRPaymentHistory, {
        payments: [payment],
        hasMore: true,
        onLoadMore: vi.fn(),
      })
    );

    expect(screen.getByText("Cargar más")).toBeInTheDocument();
  });
});
