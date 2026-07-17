import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock next/navigation for usePathname
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

import { Sidebar } from "@/components/layout/sidebar";

describe("Sidebar accessibility", () => {
  it("marks the active link with aria-current='page'", () => {
    render(<Sidebar />);

    const activeLink = screen.getByRole("link", { name: /dashboard/i });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current on inactive links", () => {
    render(<Sidebar />);

    const inactiveLink = screen.getByRole("link", { name: /billeteras/i });
    expect(inactiveLink).not.toHaveAttribute("aria-current");
  });

  it("all navigation links are accessible via keyboard", () => {
    render(<Sidebar />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });

  it("sidebar has proper landmark role via aside element", () => {
    const { container } = render(<Sidebar />);

    const aside = container.querySelector("aside");
    expect(aside).toBeInTheDocument();
  });

  it("navigation is wrapped in a nav element", () => {
    const { container } = render(<Sidebar />);

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });
});
