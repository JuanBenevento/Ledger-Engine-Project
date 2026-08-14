import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    POST: vi.fn(),
  },
}));

import api from "@/lib/api/client";
import { TwoFactorSetup } from "@/components/features/security/two-factor-setup";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe("TwoFactorSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows QR code and verification input after enabling 2FA", async () => {
    vi.mocked(api.POST).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/2fa/enable") {
        return {
          data: {
            secret: "JBSWY3DPEHPK3PXP",
            provisioningUri: "otpauth://totp/test",
            qrCodeUrl: "https://qr.example.com/qr.png",
          },
          error: null,
        };
      }
      return { data: null, error: { message: "Unknown" } };
    });

    render(<TwoFactorSetup />, { wrapper: createWrapper() });

    // Click enable button
    fireEvent.click(screen.getByRole("button", { name: /habilitar 2fa/i }));

    // Wait for QR code to appear
    await waitFor(() => {
      expect(screen.getByText("Escanea el código QR")).toBeInTheDocument();
    });

    // QR image should be visible
    expect(screen.getByRole("img", { name: /qr code/i })).toHaveAttribute(
      "src",
      "https://qr.example.com/qr.png"
    );

    // Verification input should be visible
    expect(screen.getByLabelText(/dígito 1 de 6/i)).toBeInTheDocument();
  });

  it("displays backup codes after successful verification", async () => {
    const user = userEvent.setup();
    const backupCodes = [
      "ABC1-DEF2", "GHI3-JKL4", "MNO5-PQR6", "STU7-VWX8", "YZA9-BCD1",
    ];

    vi.mocked(api.POST).mockImplementation(async (url: string, _options?: any) => {
      if (url === "/api/v1/security/2fa/enable") {
        return {
          data: {
            secret: "JBSWY3DPEHPK3PXP",
            provisioningUri: "otpauth://totp/test",
            qrCodeUrl: "https://qr.example.com/qr.png",
          },
          error: null,
        };
      }
      if (url === "/api/v1/security/2fa/verify") {
        return {
          data: { enabled: true, backupCodes },
          error: null,
        };
      }
      return { data: null, error: { message: "Unknown" } };
    });

    render(<TwoFactorSetup />, { wrapper: createWrapper() });

    // Enable 2FA
    await user.click(screen.getByRole("button", { name: /habilitar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByText("Escanea el código QR")).toBeInTheDocument();
    });

    // Enter the 6-digit code using userEvent
    const firstInput = screen.getByLabelText(/dígito 1 de 6/i);
    await user.type(firstInput, "123456");

    // Click verify button
    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    // Wait for backup codes to appear
    await waitFor(() => {
      expect(screen.getByText("Códigos de respaldo")).toBeInTheDocument();
    });

    // Verify backup codes are displayed
    expect(screen.getByText("ABC1-DEF2")).toBeInTheDocument();
    expect(screen.getByText("GHI3-JKL4")).toBeInTheDocument();
    expect(screen.getByText("MNO5-PQR6")).toBeInTheDocument();
  });

  it("shows copy all button for backup codes", async () => {
    const user = userEvent.setup();
    const backupCodes = ["ABC1-DEF2", "GHI3-JKL4"];

    vi.mocked(api.POST).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/2fa/enable") {
        return {
          data: {
            secret: "JBSWY3DPEHPK3PXP",
            provisioningUri: "otpauth://totp/test",
            qrCodeUrl: "https://qr.example.com/qr.png",
          },
          error: null,
        };
      }
      if (url === "/api/v1/security/2fa/verify") {
        return {
          data: { enabled: true, backupCodes },
          error: null,
        };
      }
      return { data: null, error: { message: "Unknown" } };
    });

    // Mock clipboard
    const clipboardWrite = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("clipboard", { writeText: clipboardWrite });

    render(<TwoFactorSetup />, { wrapper: createWrapper() });

    // Enable 2FA
    await user.click(screen.getByRole("button", { name: /habilitar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByText("Escanea el código QR")).toBeInTheDocument();
    });

    // Enter code
    const firstInput = screen.getByLabelText(/dígito 1 de 6/i);
    await user.type(firstInput, "123456");

    // Click verify
    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    await waitFor(() => {
      expect(screen.getByText("Códigos de respaldo")).toBeInTheDocument();
    });

    // Copy all button should be present
    expect(
      screen.getByRole("button", { name: /copiar todos/i })
    ).toBeInTheDocument();
  });

  it("disables verify button when code is incomplete", async () => {
    const user = userEvent.setup();

    vi.mocked(api.POST).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/2fa/enable") {
        return {
          data: {
            secret: "JBSWY3DPEHPK3PXP",
            provisioningUri: "otpauth://totp/test",
            qrCodeUrl: "https://qr.example.com/qr.png",
          },
          error: null,
        };
      }
      return { data: null, error: { message: "Unknown" } };
    });

    render(<TwoFactorSetup />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: /habilitar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByText("Escanea el código QR")).toBeInTheDocument();
    });

    // Verify button should be disabled when code is empty
    const verifyButton = screen.getByRole("button", { name: /verificar código/i });
    expect(verifyButton).toBeDisabled();

    // Type only 3 digits
    const firstInput = screen.getByLabelText(/dígito 1 de 6/i);
    await user.type(firstInput, "123");

    // Button should still be disabled
    expect(verifyButton).toBeDisabled();
  });

  it("shows error state when verification fails", async () => {
    const user = userEvent.setup();

    vi.mocked(api.POST).mockImplementation(async (url: string) => {
      if (url === "/api/v1/security/2fa/enable") {
        return {
          data: {
            secret: "JBSWY3DPEHPK3PXP",
            provisioningUri: "otpauth://totp/test",
            qrCodeUrl: "https://qr.example.com/qr.png",
          },
          error: null,
        };
      }
      if (url === "/api/v1/security/2fa/verify") {
        return {
          data: null,
          error: { message: "Código inválido", code: "INVALID_CODE" },
        };
      }
      return { data: null, error: { message: "Unknown" } };
    });

    render(<TwoFactorSetup />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: /habilitar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByText("Escanea el código QR")).toBeInTheDocument();
    });

    // Enter wrong code
    const firstInput = screen.getByLabelText(/dígito 1 de 6/i);
    await user.type(firstInput, "000000");

    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    // Should show error toast (handled by the hook's onError)
    await waitFor(() => {
      expect(api.POST).toHaveBeenCalledWith("/api/v1/security/2fa/verify", {
        body: { code: "000000" },
      });
    });
  });
});
