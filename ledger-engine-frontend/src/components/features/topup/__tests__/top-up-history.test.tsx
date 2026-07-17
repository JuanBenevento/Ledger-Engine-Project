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

import { TopUpHistory } from "../top-up-history";

function createTopUp(overrides: Partial<Record<string, any>> = {}) {
  return {
    topUpId: "topup-1",
    walletId: "wallet-1",
    amount: 50000,
    currency: "COP",
    method: "CARD",
    status: "COMPLETED",
    referenceCode: "REF-001",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("TopUpHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no top-ups", () => {
    render(React.createElement(TopUpHistory, { topUps: [] }));

    expect(screen.getByText("No hay recargas")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading and no top-ups", () => {
    render(React.createElement(TopUpHistory, { topUps: [], isLoading: true }));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders a CARD top-up", () => {
    const topUp = createTopUp({ method: "CARD", amount: 100000 });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    expect(screen.getByText("Tarjeta")).toBeInTheDocument();
    expect(screen.getByText("+ $ 100,000")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toHaveTextContent("Historial de recargas");
  });

  it("renders a CASH top-up", () => {
    const topUp = createTopUp({ method: "CASH", amount: 200000 });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    expect(screen.getByText("Efectivo")).toBeInTheDocument();
    expect(screen.getByText("+ $ 200,000")).toBeInTheDocument();
  });

  it("renders a PSE top-up", () => {
    const topUp = createTopUp({ method: "PSE", amount: 75000 });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    expect(screen.getByText("PSE")).toBeInTheDocument();
    expect(screen.getByText("+ $ 75,000")).toBeInTheDocument();
  });

  it("shows status badge with correct variant (COMPLETED=default)", () => {
    const topUp = createTopUp({ status: "COMPLETED" });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Completado");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("shows status badge with correct variant (PENDING=secondary)", () => {
    const topUp = createTopUp({ status: "PENDING" });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Pendiente");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("shows status badge with correct variant (FAILED=destructive)", () => {
    const topUp = createTopUp({ status: "FAILED" });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("Fallido");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("shows load more button when hasMore is true", () => {
    const topUp = createTopUp();
    render(React.createElement(TopUpHistory, { topUps: [topUp], hasMore: true, onLoadMore: vi.fn() }));

    expect(screen.getByText("Cargar más")).toBeInTheDocument();
  });

  it("calls onLoadMore when load more button is clicked", () => {
    const onLoadMore = vi.fn();
    const topUp = createTopUp();
    render(React.createElement(TopUpHistory, { topUps: [topUp], hasMore: true, onLoadMore }));

    fireEvent.click(screen.getByText("Cargar más"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("formats date in es-CO locale", () => {
    const topUp = createTopUp({ createdAt: "2026-03-15T14:30:00Z" });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    // Date should be formatted in Spanish
    const dateElement = screen.getByText(/marzo/i);
    expect(dateElement).toBeInTheDocument();
  });

  it("displays reference code when provided", () => {
    const topUp = createTopUp({ referenceCode: "REF-12345" });
    render(React.createElement(TopUpHistory, { topUps: [topUp] }));

    expect(screen.getByText("REF-12345")).toBeInTheDocument();
  });
});
