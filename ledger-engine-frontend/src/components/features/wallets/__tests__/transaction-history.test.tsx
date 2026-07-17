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

import { TransactionHistory } from "../transaction-history";

function createTransaction(overrides: Partial<Record<string, any>> = {}) {
  return {
    transactionId: "tx-1",
    walletId: "wallet-1",
    type: "DEPOSIT",
    amount: 50000,
    currency: "COP",
    description: "Compra en tienda",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("TransactionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no transactions", () => {
    render(React.createElement(TransactionHistory, { transactions: [] }));

    expect(screen.getByText("No hay transacciones recientes")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading and no transactions", () => {
    render(React.createElement(TransactionHistory, { transactions: [], isLoading: true }));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders a transaction with DEPOSIT type (green + icon)", () => {
    const tx = createTransaction({ type: "DEPOSIT", amount: 50000, description: "Depósito inicial" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Depósito")).toBeInTheDocument();
    expect(screen.getByText("Depósito inicial")).toBeInTheDocument();
    expect(screen.getByText("+ $ 50,000")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Historial de transacciones");
  });

  it("renders a transaction with WITHDRAWAL type (rose - icon)", () => {
    const tx = createTransaction({ type: "WITHDRAWAL", amount: 20000, description: "Retiro en cajero" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Retiro")).toBeInTheDocument();
    expect(screen.getByText("Retiro en cajero")).toBeInTheDocument();
    expect(screen.getByText("- $ 20,000")).toBeInTheDocument();
  });

  it("groups transactions by date (Hoy for today)", () => {
    const today = new Date();
    const tx1 = createTransaction({ transactionId: "tx-1", createdAt: today.toISOString() });
    const tx2 = createTransaction({ transactionId: "tx-2", createdAt: today.toISOString() });
    render(React.createElement(TransactionHistory, { transactions: [tx1, tx2] }));

    expect(screen.getAllByText("Hoy").length).toBeGreaterThanOrEqual(1);
  });

  it("shows status badge with correct variant (COMPLETED=default)", () => {
    const tx = createTransaction({ status: "COMPLETED" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Completado");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("shows status badge with correct variant (PENDING=secondary)", () => {
    const tx = createTransaction({ status: "PENDING" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Pendiente");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("shows status badge with correct variant (FAILED=destructive)", () => {
    const tx = createTransaction({ status: "FAILED" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Fallido");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("shows loader spinner when hasMore is true", () => {
    const tx = createTransaction();
    render(React.createElement(TransactionHistory, { transactions: [tx], hasMore: true }));

    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });

  it("shows negative prefix for TRANSFER type", () => {
    const tx = createTransaction({ type: "TRANSFER", amount: 30000, description: "A another wallet" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(screen.getByText("- $ 30,000")).toBeInTheDocument();
  });

  it("shows positive prefix for TOPUP type", () => {
    const tx = createTransaction({ type: "TOPUP", amount: 15000, description: "Recarga móvil" });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Recarga")).toBeInTheDocument();
    expect(screen.getByText("+ $ 15,000")).toBeInTheDocument();
  });

  it("displays counterparty name when no description", () => {
    const tx = createTransaction({ description: undefined, counterparty: { name: "Juan Perez" } });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
  });

  it("displays fallback text when no description and no counterparty", () => {
    const tx = createTransaction({ description: undefined, counterparty: undefined });
    render(React.createElement(TransactionHistory, { transactions: [tx] }));

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
  });
});