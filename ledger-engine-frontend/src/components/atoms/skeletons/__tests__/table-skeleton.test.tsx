import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock Skeleton
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Mock Card
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) =>
    React.createElement("div", { "data-testid": "card", className }, children),
  CardContent: ({ children }: any) =>
    React.createElement("div", { "data-testid": "card-content" }, children),
  CardHeader: ({ children }: any) =>
    React.createElement("div", { "data-testid": "card-header" }, children),
  CardTitle: ({ children }: any) =>
    React.createElement("h3", { "data-testid": "card-title" }, children),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { TableSkeleton } from "../table-skeleton";

describe("TableSkeleton", () => {
  it("renders a card container", () => {
    render(<TableSkeleton />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders a skeleton title in header", () => {
    render(<TableSkeleton />);

    const header = screen.getByTestId("card-header");
    const headerSkeletons = header.querySelectorAll('[data-slot="skeleton"]');
    expect(headerSkeletons.length).toBe(1);
  });

  it("renders skeleton rows for the table body", () => {
    render(<TableSkeleton />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // Header skeleton + rows × columns = many skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("renders default 5 rows", () => {
    render(<TableSkeleton />);

    const content = screen.getByTestId("card-content");
    const contentSkeletons = content.querySelectorAll('[data-slot="skeleton"]');
    // 5 rows × columns (at least 3 per row) = 15 minimum
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(15);
  });

  it("accepts custom rows count", () => {
    render(<TableSkeleton rows={3} />);

    const content = screen.getByTestId("card-content");
    const contentSkeletons = content.querySelectorAll('[data-slot="skeleton"]');
    // 3 rows × columns (at least 3 per row) = 9 minimum
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(9);
  });

  it("accepts custom columns count", () => {
    render(<TableSkeleton rows={2} columns={5} />);

    const content = screen.getByTestId("card-content");
    const contentSkeletons = content.querySelectorAll('[data-slot="skeleton"]');
    // 2 rows × 5 columns = 10 minimum
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("applies custom className", () => {
    render(<TableSkeleton className="custom-class" />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-class");
  });
});
