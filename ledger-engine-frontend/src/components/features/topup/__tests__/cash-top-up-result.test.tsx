import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
vi.mock("@/lib/api/hooks/use-topups", () => ({
  useCashTopUp: vi.fn(),
  useConfirmCashTopUp: vi.fn(),
}));

// Mock clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Import after mocking
import { useConfirmCashTopUp } from "@/lib/api/hooks/use-topups";
import { CashTopUpResult } from "../cash-top-up-result";

// Create a test wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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

const defaultProps = {
  topUpId: "topup-123",
  referenceCode: "REF-12345678",
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  amount: 50000,
};

describe("CashTopUpResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reference number", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    expect(screen.getByText("REF-12345678")).toBeInTheDocument();
  });

  it("shows copy button for reference code", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    const copyButton = screen.getByRole("button", { name: /copiar/i });
    expect(copyButton).toBeInTheDocument();
  });

  it("copies reference code to clipboard when copy button is clicked", async () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    const copyButton = screen.getByRole("button", { name: /copiar/i });
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("REF-12345678");
  });

  it("shows payment instructions in Spanish", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    expect(screen.getByText(/baloto/i)).toBeInTheDocument();
    expect(screen.getByText(/efecty/i)).toBeInTheDocument();
  });

  it("shows expiry countdown", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    expect(screen.getByText(/vencimiento/i)).toBeInTheDocument();
  });

  it("renders confirm button with text", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    const confirmButton = screen.getByRole("button", { name: /ya pagué/i });
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).not.toBeDisabled();
  });

  it("calls mutation when confirm button is clicked", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ status: "COMPLETED" });
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    const confirmButton = screen.getByRole("button", { name: /ya pagué/i });
    fireEvent.click(confirmButton);

    expect(mockMutateAsync).toHaveBeenCalledWith("topup-123");
  });

  it("shows loading state when confirm is pending", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    const confirmButton = screen.getByRole("button", { name: /confirmando/i });
    expect(confirmButton).toBeDisabled();
  });

  it("displays amount in COP format", () => {
    vi.mocked(useConfirmCashTopUp).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useConfirmCashTopUp>);

    const wrapper = createWrapper();
    render(React.createElement(CashTopUpResult, defaultProps), { wrapper });

    expect(screen.getByText(/\$ 50\.000/)).toBeInTheDocument();
  });
});
