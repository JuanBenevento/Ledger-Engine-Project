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

// Mock Tabs — render all TabsContent panels (no tab switching in tests)
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

import { TransferHistory } from "../transfer-history";

function createTransfer(overrides: Partial<Record<string, any>> = {}) {
  return {
    transferId: "txn-1",
    type: "TRANSFER",
    amount: 50000,
    currency: "COP",
    status: "COMPLETED",
    description: "Transferencia a Carlos",
    createdAt: new Date().toISOString(),
    counterparty: { name: "Carlos M." },
    direction: "SENT",
    ...overrides,
  };
}

describe("TransferHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no transfers", () => {
    render(React.createElement(TransferHistory, { transfers: [] }));

    expect(screen.getByText("No hay transferencias")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading and no transfers", () => {
    render(React.createElement(TransferHistory, { transfers: [], isLoading: true }));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders a sent transfer with correct amount", () => {
    const transfer = createTransfer({ direction: "SENT", amount: 50000, description: "Transferencia a Carlos" });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    expect(screen.getByText("Transferencia a Carlos")).toBeInTheDocument();
    expect(screen.getByText("- $ 50,000")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Historial de transferencias");
  });

  it("renders a received transfer with correct amount", () => {
    const transfer = createTransfer({ direction: "RECEIVED", amount: 100000, description: "De María" });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    expect(screen.getByText("De María")).toBeInTheDocument();
    expect(screen.getByText("+ $ 100,000")).toBeInTheDocument();
  });

  it("shows status badge with correct variant (COMPLETED=default)", () => {
    const transfer = createTransfer({ status: "COMPLETED" });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Completado");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("shows status badge with correct variant (PENDING=secondary)", () => {
    const transfer = createTransfer({ status: "PENDING" });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Pendiente");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("shows status badge with correct variant (FAILED=destructive)", () => {
    const transfer = createTransfer({ status: "FAILED" });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Fallido");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("displays tabs with Enviados and Recibidos when transfers exist", () => {
    const transfer = createTransfer();
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByText("Enviados")).toBeInTheDocument();
    expect(screen.getByText("Recibidos")).toBeInTheDocument();
  });

  it("displays counterparty name when no description", () => {
    const transfer = createTransfer({ description: undefined, counterparty: { name: "Ana G." } });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    expect(screen.getByText("Ana G.")).toBeInTheDocument();
  });

  it("displays fallback text when no description and no counterparty", () => {
    const transfer = createTransfer({ description: undefined, counterparty: undefined });
    render(React.createElement(TransferHistory, { transfers: [transfer] }));

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", () => {
    const transfer = createTransfer();
    render(
      React.createElement(TransferHistory, {
        transfers: [transfer],
        hasMore: true,
        onLoadMore: vi.fn(),
      })
    );

    expect(screen.getByText("Cargar más")).toBeInTheDocument();
  });

  it("calls onLoadMore when load more button is clicked", () => {
    const onLoadMore = vi.fn();
    const transfer = createTransfer();
    render(
      React.createElement(TransferHistory, {
        transfers: [transfer],
        hasMore: true,
        onLoadMore,
      })
    );

    fireEvent.click(screen.getByText("Cargar más"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
