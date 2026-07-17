import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ErrorState } from "@/components/atoms/error-state";

describe("ErrorState", () => {
  it("renders title and message", () => {
    render(
      <ErrorState
        title="Error al cargar datos"
        message="No se pudieron obtener los datos del servidor"
      />
    );

    expect(screen.getByText("Error al cargar datos")).toBeInTheDocument();
    expect(screen.getByText("No se pudieron obtener los datos del servidor")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Error"
        message="Algo falló"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(
      <ErrorState
        title="Error"
        message="Algo falló"
      />
    );

    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Error"
        message="Algo falló"
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
      <ErrorState
        title="Error"
        message="Algo falló"
        onRetry={onRetry}
        isRetrying={true}
      />
    );

    // Button should be disabled during retry
    const retryButton = screen.getByRole("button", { name: /reintentando/i });
    expect(retryButton).toBeDisabled();
  });

  it("shows error icon", () => {
    render(
      <ErrorState
        title="Error"
        message="Algo falló"
      />
    );

    const errorIcon = screen.getByTestId("error-icon");
    expect(errorIcon).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <ErrorState
        title="Error"
        message="Algo falló"
      />
    );

    // Should have role="alert" for screen readers
    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toBeInTheDocument();
  });

  it("renders with custom title and message", () => {
    render(
      <ErrorState
        title="Error de conexión"
        message="No se pudo conectar al servidor. Verifica tu conexión a internet."
      />
    );

    expect(screen.getByText("Error de conexión")).toBeInTheDocument();
    expect(screen.getByText("No se pudo conectar al servidor. Verifica tu conexión a internet.")).toBeInTheDocument();
  });
});
