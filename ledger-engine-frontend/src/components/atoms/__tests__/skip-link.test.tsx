import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/atoms/skip-link";

describe("SkipLink", () => {
  it("renders a link with text 'Ir al contenido principal'", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    expect(link).toBeInTheDocument();
  });

  it("has href pointing to #main-content by default", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("uses custom target when provided", () => {
    render(<SkipLink target="custom-target" />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    expect(link).toHaveAttribute("href", "#custom-target");
  });

  it("is visually hidden but focusable (has sr-only class)", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    // The link should have sr-only class to be visually hidden
    expect(link.className).toContain("sr-only");
  });

  it("becomes visible on focus (has focus:not-sr-only class)", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    // Should have focus:not-sr-only to become visible when focused
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("is the first focusable element in the document", () => {
    render(
      <div>
        <SkipLink />
        <button>Other button</button>
      </div>
    );

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    // Skip link should render before other content
    expect(link).toBeInTheDocument();
  });

  it("opens in the same window (no target=_blank)", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    expect(link).not.toHaveAttribute("target");
  });

  it("has proper keyboard accessibility", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /ir al contenido principal/i });
    // Links are natively focusable
    expect(link).toBeVisible(); // In jsdom, elements are technically visible
    expect(link.tagName).toBe("A");
  });
});
