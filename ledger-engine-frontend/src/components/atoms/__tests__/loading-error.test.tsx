import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LoadingError } from "@/components/atoms/loading-error";

describe("LoadingError", () => {
  it("renders error message", () => {
    render(
      <LoadingError message="Error al cargar datos" />
    );

    expect(screen.getByText("Error al cargar datos")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(
      <LoadingError
        message="Error al cargar datos"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(
      <LoadingError message="Error al cargar datos" />
    );

    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(
      <LoadingError
        message="Error al cargar datos"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isRetrying is true", () => {
    const onRetry = vi.fn();
    render(
      <LoadingError
        message="Error al cargar datos"
        onRetry={onRetry}
        isRetrying={true}
      />
    );

    // Button should be disabled during retry
    const retryButton = screen.getByRole("button", { name: /reintentando/i });
    expect(retryButton).toBeDisabled();
  });

  it("renders with compact design for inline use", () => {
    const { container } = render(
      <LoadingError message="Error al cargar datos" />
    );

    // Should have compact styling
    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass("flex", "items-center", "gap-2");
  });

  it("shows error icon", () => {
    render(
      <LoadingError message="Error al cargar datos" />
    );

    const errorIcon = screen.getByTestId("error-icon");
    expect(errorIcon).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <LoadingError message="Error al cargar datos" />
    );

    // Should have role="alert" for screen readers
    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toBeInTheDocument();
  });
});
