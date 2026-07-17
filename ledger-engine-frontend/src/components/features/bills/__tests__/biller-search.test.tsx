import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-bills", () => ({
  useBillerSearch: vi.fn(),
}));

vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => React.createElement("input", { ...props, ref, "data-testid": "input" })
  ),
}));

import { useBillerSearch } from "@/lib/api/hooks/use-bills";
import { BillerSearch } from "../biller-search";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe("BillerSearch", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBillerSearch).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useBillerSearch>);
  });

  it("renders search input", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });
    expect(screen.getByLabelText("Buscar facturador")).toBeInTheDocument();
  });

  it("shows category filters", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });
    expect(screen.getAllByText("Energía").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Agua").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Gas").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Telecom").length).toBeGreaterThanOrEqual(1);
  });

  it("shows popular billers section", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });
    expect(screen.getByText("Facturadores populares")).toBeInTheDocument();
  });

  it("shows search results when billers are found", () => {
    vi.mocked(useBillerSearch).mockReturnValue({
      data: [
        { id: "biller-1", name: "EPM", category: "Energía", active: true },
        { id: "biller-3", name: "Vasa", category: "Agua", active: true },
      ],
      isLoading: false,
    } as ReturnType<typeof useBillerSearch>);

    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByText("EPM")).toBeInTheDocument();
    expect(screen.getByText("Vasa")).toBeInTheDocument();
  });

  it("calls onSelect when a biller is clicked", () => {
    vi.mocked(useBillerSearch).mockReturnValue({
      data: [
        { id: "biller-1", name: "EPM", category: "Energía", active: true },
      ],
      isLoading: false,
    } as ReturnType<typeof useBillerSearch>);

    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });

    fireEvent.click(screen.getByText("EPM"));

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "biller-1",
        name: "EPM",
        category: "Energía",
      })
    );
  });

  it("calls onSelect when a popular biller is clicked", () => {
    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });

    fireEvent.click(screen.getByText("EPM"));

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    vi.mocked(useBillerSearch).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useBillerSearch>);

    const wrapper = createWrapper();
    render(React.createElement(BillerSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByText("Buscando facturadores...")).toBeInTheDocument();
  });
});
