import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

// Mock Input
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => React.createElement("input", { "data-testid": "input", ...props }),
}));

// Mock Label
vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => React.createElement("label", props, children),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => React.createElement("button", { "data-testid": "button", ...props }, children),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import QRPayPage from "../page";

describe("QRPayPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", () => {
    render(React.createElement(QRPayPage));
    expect(screen.getByText("Escanear código QR")).toBeInTheDocument();
  });

  it("renders camera viewfinder placeholder in initial/loading state", async () => {
    await act(async () => {
      render(React.createElement(QRPayPage));
    });

    // In jsdom, navigator.mediaDevices is undefined so component falls to "denied" state
    await waitFor(() => {
      expect(screen.getByText("Permiso de cámara requerido")).toBeInTheDocument();
    });
  });

  it("renders manual input fallback", () => {
    render(React.createElement(QRPayPage));

    expect(screen.getByText("Ingresar código manualmente")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("renders file upload fallback", () => {
    render(React.createElement(QRPayPage));

    expect(screen.getByText("Subir imagen del código QR")).toBeInTheDocument();
  });

  it("allows manual QR code entry", () => {
    render(React.createElement(QRPayPage));

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "qr-code-123" } });

    expect(input).toHaveValue("qr-code-123");
  });

  it("renders page description", () => {
    render(React.createElement(QRPayPage));

    expect(screen.getByText("Apunta la cámara al código QR o ingresa el código manualmente")).toBeInTheDocument();
  });
});
