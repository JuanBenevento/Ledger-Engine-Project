import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ErrorBoundary } from "@/components/atoms/error-boundary";

// Component that throws an error for testing
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div data-testid="child">Child content</div>;
}

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  return () => {
    console.error = originalConsoleError;
  };
});

describe("ErrorBoundary", () => {
  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("catches errors and shows fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error message in Spanish
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByText("Ha ocurrido un error inesperado. Por favor, intenta de nuevo.")).toBeInTheDocument();
    
    // Should show retry button
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
    
    // Child should not be rendered
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("retry button calls reset and re-renders children", () => {
    let shouldThrow = true;
    
    function ControlledThrowingComponent() {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div data-testid="child">Child content</div>;
    }

    const { _rerender } = render(
      <ErrorBoundary key="boundary-1">
        <ControlledThrowingComponent />
      </ErrorBoundary>
    );

    // Initially shows error
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    
    // Fix the error condition
    shouldThrow = false;
    
    // Click retry button
    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    fireEvent.click(retryButton);
    
    // After retry, should show children again
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("shows error icon in fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for error icon (AlertTriangle or similar)
    const errorIcon = screen.getByTestId("error-icon");
    expect(errorIcon).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error container should have role="alert"
    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toBeInTheDocument();
    
    // Retry button should be focusable
    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toHaveAttribute("type", "button");
  });
});
