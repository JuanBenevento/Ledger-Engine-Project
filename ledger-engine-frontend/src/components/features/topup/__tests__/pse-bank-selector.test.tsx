import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  SearchIcon: () => React.createElement("span", { "data-testid": "search-icon" }, "🔍"),
  Loader2: () => React.createElement("span", { "data-testid": "loader-icon" }, "..."),
  CheckIcon: () => React.createElement("span", { "data-testid": "check-icon" }, "✓"),
  BuildingIcon: () => React.createElement("span", { "data-testid": "building-icon" }, "🏦"),
}));

// Mock the Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) =>
    React.createElement(
      "button",
      {
        disabled,
        onClick,
        "data-variant": variant,
        ...props,
      },
      children
    ),
}));

// Mock the Input component
vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement(
      "input",
      {
        placeholder,
        value,
        onChange,
        type: "text",
        ...props,
      }
    ),
}));

// Import after mocking
import { PSEBankSelector } from "../pse-bank-selector";

describe("PSEBankSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the bank list", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    expect(screen.getByText("Bancolombia")).toBeInTheDocument();
    expect(screen.getByText("Davivienda")).toBeInTheDocument();
    expect(screen.getByText("BBVA")).toBeInTheDocument();
    expect(screen.getByText("Banco de Bogotá")).toBeInTheDocument();
    expect(screen.getByText("Banco Popular")).toBeInTheDocument();
    expect(screen.getByText("Banco AV Villas")).toBeInTheDocument();
  });

  it("renders search input", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    expect(screen.getByPlaceholderText(/buscar banco/i)).toBeInTheDocument();
  });

  it("filters banks on search", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    const searchInput = screen.getByPlaceholderText(/buscar banco/i);
    fireEvent.change(searchInput, { target: { value: "Bancolombia" } });

    expect(screen.getByText("Bancolombia")).toBeInTheDocument();
    expect(screen.queryByText("Davivienda")).not.toBeInTheDocument();
    expect(screen.queryByText("BBVA")).not.toBeInTheDocument();
  });

  it("shows no results message when search has no matches", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    const searchInput = screen.getByPlaceholderText(/buscar banco/i);
    fireEvent.change(searchInput, { target: { value: "NoExiste" } });

    expect(screen.getByText(/no se encontraron bancos/i)).toBeInTheDocument();
  });

  it("selects a bank on click", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    const bankOption = screen.getByRole("option", { name: /bancolombia/i });
    fireEvent.click(bankOption);

    expect(onSelect).toHaveBeenCalledWith({
      id: "bancolombia",
      name: "Bancolombia",
    });
  });

  it("shows selected bank state", () => {
    const onSelect = vi.fn();
    render(
      React.createElement(PSEBankSelector, {
        onSelect,
        disabled: false,
        selectedBankId: "bancolombia",
      })
    );

    const bankOption = screen.getByRole("option", { name: /bancolombia/i });
    expect(bankOption).toHaveAttribute("aria-selected", "true");
  });

  it("shows loading state during redirect", () => {
    const onSelect = vi.fn();
    render(
      React.createElement(PSEBankSelector, {
        onSelect,
        disabled: true,
      })
    );

    const searchInput = screen.getByPlaceholderText(/buscar banco/i);
    expect(searchInput).toBeDisabled();
  });

  it("displays bank icon for each bank", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    const buildingIcons = screen.getAllByTestId("building-icon");
    expect(buildingIcons.length).toBeGreaterThan(0);
  });

  it("renders header text in Spanish", () => {
    const onSelect = vi.fn();
    render(React.createElement(PSEBankSelector, { onSelect, disabled: false }));

    expect(screen.getByText(/selecciona tu banco/i)).toBeInTheDocument();
  });
});
