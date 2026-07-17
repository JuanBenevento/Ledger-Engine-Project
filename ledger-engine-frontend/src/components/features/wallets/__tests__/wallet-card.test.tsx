import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the AnimatedNumber component
vi.mock("@/hooks/use-currency", () => ({
  AnimatedNumber: ({ value }: { value: number }) =>
    React.createElement("span", { "data-testid": "animated-number" }, `$ ${value}`),
  formatCurrency: (value: number) => `$ ${value.toLocaleString("es-CO")}`,
}));

// Mock the Badge component
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    React.createElement("span", { "data-testid": "badge", "data-variant": variant }, children),
}));

// Import after mocking
import { WalletCard } from "../wallet-card";

describe("WalletCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders wallet name", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    expect(screen.getByText("Mi Ahorro")).toBeInTheDocument();
  });

  it("renders balance with COP format", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    expect(screen.getByTestId("animated-number")).toHaveTextContent("$ 1250000");
  });

  it("renders status badge for ACTIVE wallet", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    expect(screen.getByTestId("badge")).toHaveTextContent("Activa");
    expect(screen.getByTestId("badge")).toHaveAttribute("data-variant", "default");
  });

  it("renders status badge for INACTIVE wallet", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "INACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 0 }));

    expect(screen.getByTestId("badge")).toHaveTextContent("Inactiva");
    expect(screen.getByTestId("badge")).toHaveAttribute("data-variant", "secondary");
  });

  it("renders status badge for FROZEN wallet", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "FROZEN" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 500000 }));

    expect(screen.getByTestId("badge")).toHaveTextContent("Congelada");
    expect(screen.getByTestId("badge")).toHaveAttribute("data-variant", "destructive");
  });

  it("navigates to wallet detail on click", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith("/wallets/wallet-1");
  });

  it("navigates on Enter key press", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });

    expect(mockPush).toHaveBeenCalledWith("/wallets/wallet-1");
  });

  it("has correct aria-label", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "ACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 1250000 }));

    const card = screen.getByRole("button");
    expect(card).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Billetera Mi Ahorro")
    );
  });

  it("applies opacity for INACTIVE wallet", () => {
    const wallet = {
      walletId: "wallet-1",
      name: "Mi Ahorro",
      currency: "COP",
      status: "INACTIVE" as const,
      createdAt: "2026-01-15T10:00:00Z",
    };

    render(React.createElement(WalletCard, { wallet, balance: 0 }));

    const card = screen.getByRole("button");
    expect(card.className).toContain("opacity-60");
  });
});
