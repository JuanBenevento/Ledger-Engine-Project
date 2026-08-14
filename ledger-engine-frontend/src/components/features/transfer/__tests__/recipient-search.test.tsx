import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/hooks/use-transfers", () => ({
  useRecipientSearch: vi.fn(),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { "data-testid": "avatar", className }, children),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { "data-testid": "avatar-fallback", className }, children),
}));

vi.mock("@/components/ui/input", () => {
  const MockInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => React.createElement("input", { ...props, ref, "data-testid": "input" })
  );
  MockInput.displayName = "Input";
  return { Input: MockInput };
});

import { useRecipientSearch } from "@/lib/api/hooks/use-transfers";
import { RecipientSearch } from "../recipient-search";

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

describe("RecipientSearch", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRecipientSearch).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRecipientSearch>);
  });

  it("renders input field for email or phone", () => {
    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByLabelText("Correo o teléfono del destinatario")).toBeInTheDocument();
  });

  it("shows placeholder text", () => {
    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByPlaceholderText("Ej: carlos@correo.com o +57 300 123 4567")).toBeInTheDocument();
  });

  it("calls onSelect when a resolved user is clicked", () => {
    vi.mocked(useRecipientSearch).mockReturnValue({
      data: { userId: "user-1", name: "Carlos M.", email: "carlos@test.com", avatar: null },
      isLoading: false,
    } as ReturnType<typeof useRecipientSearch>);

    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    fireEvent.click(screen.getByText("Carlos M."));

    expect(mockOnSelect).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Carlos M.",
      email: "carlos@test.com",
      avatar: null,
    });
  });

  it("shows loading spinner during search", () => {
    vi.mocked(useRecipientSearch).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRecipientSearch>);

    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByText("Buscando usuario...")).toBeInTheDocument();
  });

  it("shows error when user not found", async () => {
    vi.mocked(useRecipientSearch).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRecipientSearch>);

    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    const input = screen.getByLabelText("Correo o teléfono del destinatario");
    fireEvent.change(input, { target: { value: "notfound@test.com" } });

    await waitFor(() => {
      expect(screen.getByText("No se encontró usuario")).toBeInTheDocument();
    });
  });

  it("does not show error when input is empty", () => {
    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.queryByText("No se encontró usuario")).not.toBeInTheDocument();
  });

  it("shows resolved user with name and email", () => {
    vi.mocked(useRecipientSearch).mockReturnValue({
      data: { userId: "user-1", name: "Carlos M.", email: "carlos@test.com", avatar: null },
      isLoading: false,
    } as ReturnType<typeof useRecipientSearch>);

    const wrapper = createWrapper();
    render(React.createElement(RecipientSearch, { onSelect: mockOnSelect }), { wrapper });

    expect(screen.getByText("Carlos M.")).toBeInTheDocument();
    expect(screen.getByText("carlos@test.com")).toBeInTheDocument();
  });
});
