import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  Card: ({ children, className }: any) => React.createElement("div", { "data-testid": "card", className }, children),
  CardContent: ({ children }: any) => React.createElement("div", { "data-testid": "card-content" }, children),
  CardHeader: ({ children }: any) => React.createElement("div", { "data-testid": "card-header" }, children),
  CardTitle: ({ children }: any) => React.createElement("h3", { "data-testid": "card-title" }, children),
}));

// Mock Skeleton — uses data-slot like the real component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ReceiptIcon: (props: any) => React.createElement("svg", { "data-testid": "receipt-icon", ...props }),
  Loader2Icon: (props: any) => React.createElement("svg", { "data-testid": "loader-icon", ...props }),
  ZapIcon: (props: any) => React.createElement("svg", { "data-testid": "zap-icon", ...props }),
  DropletIcon: (props: any) => React.createElement("svg", { "data-testid": "droplet-icon", ...props }),
  WifiIcon: (props: any) => React.createElement("svg", { "data-testid": "wifi-icon", ...props }),
  SmartphoneIcon: (props: any) => React.createElement("svg", { "data-testid": "smartphone-icon", ...props }),
  BuildingIcon: (props: any) => React.createElement("svg", { "data-testid": "building-icon", ...props }),
}));

import { BillPaymentHistory } from "../bill-payment-history";

function createPayment(overrides: Partial<Record<string, any>> = {}) {
  return {
    paymentId: "pay-1",
    billerName: "EPM",
    billerCategory: "Energía",
    amount: 150000,
    currency: "COP",
    reference: "REF-001",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("BillPaymentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no payments", () => {
    render(React.createElement(BillPaymentHistory, { payments: [] }));

    expect(screen.getByText("No hay pagos de servicios")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading and no payments", () => {
    render(React.createElement(BillPaymentHistory, { payments: [], isLoading: true }));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders a payment row with biller name", () => {
    const payment = createPayment({ billerName: "EPM", amount: 150000 });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    expect(screen.getByText("EPM")).toBeInTheDocument();
    expect(screen.getByText("Energía")).toBeInTheDocument();
    expect(screen.getByText("REF-001")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Historial de pagos");
  });

  it("shows status badge with correct variant (COMPLETED=default)", () => {
    const payment = createPayment({ status: "COMPLETED" });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Completado");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("shows status badge with correct variant (PROCESSING=secondary)", () => {
    const payment = createPayment({ status: "PROCESSING" });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Procesando");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("shows status badge with correct variant (FAILED=destructive)", () => {
    const payment = createPayment({ status: "FAILED" });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Fallido");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("formats COP amounts correctly", () => {
    const payment = createPayment({ amount: 2500000 });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    expect(screen.getByText("- $ 2,500,000")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", () => {
    const payment = createPayment();
    render(React.createElement(BillPaymentHistory, { payments: [payment], hasMore: true, onLoadMore: vi.fn() }));

    expect(screen.getByText("Cargar más")).toBeInTheDocument();
  });

  it("calls onLoadMore when load more button is clicked", () => {
    const onLoadMore = vi.fn();
    const payment = createPayment();
    render(React.createElement(BillPaymentHistory, { payments: [payment], hasMore: true, onLoadMore }));

    fireEvent.click(screen.getByText("Cargar más"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("formats date in es-CO locale", () => {
    const payment = createPayment({ createdAt: "2026-03-15T14:30:00Z" });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    const dateElement = screen.getByText(/marzo/i);
    expect(dateElement).toBeInTheDocument();
  });

  it("displays reference code when provided", () => {
    const payment = createPayment({ reference: "REF-12345" });
    render(React.createElement(BillPaymentHistory, { payments: [payment] }));

    expect(screen.getByText("REF-12345")).toBeInTheDocument();
  });

  it("renders category badges for each payment", () => {
    const payments = [
      createPayment({ billerName: "EPM", billerCategory: "Energía" }),
      createPayment({ paymentId: "pay-2", billerName: "EAB", billerCategory: "Agua" }),
    ];
    render(React.createElement(BillPaymentHistory, { payments }));

    const badges = screen.getAllByTestId("badge");
    expect(badges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Energía")).toBeInTheDocument();
    expect(screen.getByText("Agua")).toBeInTheDocument();
  });
});
