import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the KYC hooks
vi.mock("@/lib/api/hooks/use-kyc", () => ({
  useKYCStatus: vi.fn(),
  useSubmitKYC: vi.fn(),
  useResubmitKYC: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}));

// Mock DocumentUpload component
vi.mock("@/components/features/kyc/document-upload", () => ({
  DocumentUpload: ({ onUpload, isPending }: any) => (
    <div data-testid="document-upload">
      <button onClick={() => onUpload([new File(["test"], "test.jpg", { type: "image/jpeg" })])}>
        Upload Test
      </button>
      {isPending && <span>Uploading...</span>}
    </div>
  ),
}));

import KYCPage from "@/app/(dashboard)/kyc/page";
import {
  useKYCStatus,
  useSubmitKYC,
  useResubmitKYC,
} from "@/lib/api/hooks/use-kyc";

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

describe("KYCPage", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSubmitKYC).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    vi.mocked(useResubmitKYC).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it("renders page title", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "PENDING", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Verificación KYC")).toBeInTheDocument();
  });

  it("shows PENDING status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "PENDING", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(
      screen.getByText(/sube tus documentos para comenzar/i)
    ).toBeInTheDocument();
  });

  it("shows UNDER_REVIEW status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "UNDER_REVIEW", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(
      screen.getByText(/tu solicitud está siendo revisada/i)
    ).toBeInTheDocument();
  });

  it("shows APPROVED status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "APPROVED", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(
      screen.getByText(/tu identidad ha sido verificada/i)
    ).toBeInTheDocument();
  });

  it("shows REJECTED status with reason", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: {
        status: "REJECTED",
        documents: [],
        rejectionReason: "Documento ilegible",
      },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
    expect(screen.getByText("Documento ilegible")).toBeInTheDocument();
  });

  it("shows upload button for PENDING status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "PENDING", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    const buttons = screen.getAllByRole("button", { name: /subir documentos/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows upload button for REJECTED status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: {
        status: "REJECTED",
        documents: [],
        rejectionReason: "Documento ilegible",
      },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    const buttons = screen.getAllByRole("button", { name: /rechazar documentos/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("hides upload button for UNDER_REVIEW status", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: { status: "UNDER_REVIEW", documents: [] },
      isLoading: false,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    expect(
      screen.queryByRole("button", { name: /subir documentos/i })
    ).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(useKYCStatus).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<KYCPage />, { wrapper: createWrapper() });
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
