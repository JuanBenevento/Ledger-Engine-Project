import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the notification preferences hooks
vi.mock("@/lib/api/hooks/use-notification-preferences", () => ({
  useNotificationPreferences: vi.fn(),
  useUpdateNotificationPreferences: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}));

import NotificationPreferencesPage from "../page";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/api/hooks/use-notification-preferences";

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

describe("NotificationPreferencesPage", () => {
  const mockPreferences = [
    { type: "TOPUP_COMPLETED", push: true, email: true, sms: false },
    { type: "P2P_RECEIVED", push: true, email: false, sms: false },
    { type: "BILL_PAID", push: true, email: true, sms: false },
    { type: "SECURITY_ALERT", push: true, email: true, sms: true },
  ];

  const mockMutate = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: { preferences: mockPreferences },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useUpdateNotificationPreferences).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it("renders page title", () => {
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Preferencias de notificación")).toBeInTheDocument();
  });

  it("renders notification type labels", () => {
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Recarga")).toBeInTheDocument();
    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(screen.getByText("Pago de servicio")).toBeInTheDocument();
    expect(screen.getByText("Alerta de seguridad")).toBeInTheDocument();
  });

  it("renders channel column headers", () => {
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Push")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("SMS")).toBeInTheDocument();
  });

  it("disables SECURITY_ALERT toggles", () => {
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    // Find all toggles for SECURITY_ALERT row
    const securityRow = screen.getByText("Alerta de seguridad").closest("tr");
    expect(securityRow).toBeTruthy();
    const toggles = securityRow?.querySelectorAll("input[type='checkbox']");
    toggles?.forEach((toggle) => {
      expect(toggle).toBeDisabled();
    });
  });

  it("shows tooltip on disabled SECURITY_ALERT toggle", async () => {
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    const securityRow = screen.getByText("Alerta de seguridad").closest("tr");
    const toggleWrapper = securityRow?.querySelector("span[title]");
    expect(toggleWrapper).toHaveAttribute(
      "title",
      "Las alertas de seguridad no se pueden desactivar"
    );
  });

  it("calls mutateAsync when save button is clicked", async () => {
    mockMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    const saveButton = screen.getByText("Guardar preferencias");
    await user.click(saveButton);
    expect(mockMutateAsync).toHaveBeenCalled();
  });

  it("shows loading state while fetching preferences", () => {
    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    render(<NotificationPreferencesPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Cargando preferencias...")).toBeInTheDocument();
  });
});