import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the auth module - use React.createElement to avoid JSX in vi.mock
vi.mock("@/lib/auth", () => {
  const AuthProviderComponent = ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "auth-provider" }, children);
  AuthProviderComponent.displayName = "AuthProvider";

  return {
    AuthProvider: AuthProviderComponent,
    useAuth: () => ({
      initialized: true,
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: vi.fn(),
    }),
  };
});

// Mock the QueryProvider
vi.mock("@/components/providers/query-provider", () => {
  const QueryProviderComponent = ({
    children,
  }: {
    children: React.ReactNode;
  }) =>
    React.createElement("div", { "data-testid": "query-provider" }, children);
  QueryProviderComponent.displayName = "QueryProvider";

  return {
    QueryProvider: QueryProviderComponent,
  };
});

// Mock sonner to avoid issues in test
vi.mock("sonner", () => ({
  Toaster: () => React.createElement("div", { "data-testid": "toaster" }),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children with providers", async () => {
    const { default: RootLayout } = await import("@/app/layout");

    const TestChild = () =>
      React.createElement("div", { "data-testid": "test-child" }, "Test Content");

    render(
      React.createElement(RootLayout, null, React.createElement(TestChild))
    );

    // Check that providers wrap the content
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("query-provider")).toBeInTheDocument();
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("sets Spanish language on html element", async () => {
    const { default: RootLayout } = await import("@/app/layout");

    const { container } = render(
      React.createElement(RootLayout, null, React.createElement("div", null, "Test"))
    );

    // In jsdom, the <html> element rendered by React is inside the container
    const htmlElement = container.querySelector("html");
    expect(htmlElement).toHaveAttribute("lang", "es");
  });
});

describe("LandingPage", () => {
  it("renders hero section", async () => {
    const { default: LandingPage } = await import("@/app/page");

    render(React.createElement(LandingPage));

    expect(screen.getByText(/Tu billetera virtual/i)).toBeInTheDocument();
    expect(screen.getByText(/segura y rápida/i)).toBeInTheDocument();
  });

  it("renders CTA buttons", async () => {
    const { default: LandingPage } = await import("@/app/page");

    render(React.createElement(LandingPage));

    expect(screen.getByText(/Crear cuenta gratis/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
  });

  it("renders features section", async () => {
    const { default: LandingPage } = await import("@/app/page");

    render(React.createElement(LandingPage));

    expect(screen.getByText(/Billeteras Múltiples/i)).toBeInTheDocument();
    expect(screen.getByText(/Recargas Fáciles/i)).toBeInTheDocument();
    expect(screen.getByText(/Pagos por QR/i)).toBeInTheDocument();
  });

  it("renders footer", async () => {
    const { default: LandingPage } = await import("@/app/page");

    render(React.createElement(LandingPage));

    expect(screen.getByText(/© 2026 Ledger Engine/i)).toBeInTheDocument();
  });
});
