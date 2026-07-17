import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisuallyHidden } from "@/components/atoms/visually-hidden";

describe("VisuallyHidden", () => {
  it("renders children text that is accessible to screen readers", () => {
    render(<VisuallyHidden>Close dialog</VisuallyHidden>);

    const text = screen.getByText("Close dialog");
    expect(text).toBeInTheDocument();
  });

  it("has the sr-only class to hide visually", () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);

    const text = screen.getByText("Hidden text");
    expect(text.className).toContain("sr-only");
  });

  it("renders as a span element by default", () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);

    const text = screen.getByText("Screen reader text");
    expect(text.tagName).toBe("SPAN");
  });

  it("accepts custom as prop to render different element", () => {
    render(
      <VisuallyHidden as="p">Paragraph hidden text</VisuallyHidden>
    );

    const text = screen.getByText("Paragraph hidden text");
    expect(text.tagName).toBe("P");
  });

  it("preserves additional className", () => {
    render(
      <VisuallyHidden className="custom-class">Extra class text</VisuallyHidden>
    );

    const text = screen.getByText("Extra class text");
    expect(text.className).toContain("sr-only");
    expect(text.className).toContain("custom-class");
  });

  it("passes through additional HTML attributes", () => {
    render(
      <VisuallyHidden id="my-id" data-testid="hidden-el">
        With attributes
      </VisuallyHidden>
    );

    const text = screen.getByTestId("hidden-el");
    expect(text).toHaveAttribute("id", "my-id");
  });

  it("renders complex children (not just strings)", () => {
    render(
      <VisuallyHidden>
        <strong>Bold hidden text</strong>
      </VisuallyHidden>
    );

    const text = screen.getByText("Bold hidden text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("STRONG");
  });

  it("focus styles are included to keep visible on keyboard focus", () => {
    render(<VisuallyHidden>Focusable text</VisuallyHidden>);

    const text = screen.getByText("Focusable text");
    // Should include focus styles so focused elements remain accessible
    expect(text.className).toContain("focus:not-sr-only");
  });
});
