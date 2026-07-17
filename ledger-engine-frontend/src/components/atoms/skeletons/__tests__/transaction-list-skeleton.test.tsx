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

import { TransactionListSkeleton } from "../transaction-list-skeleton";

describe("TransactionListSkeleton", () => {
  it("renders a card container", () => {
    render(<TransactionListSkeleton />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders a skeleton title in header", () => {
    render(<TransactionListSkeleton />);

    const header = screen.getByTestId("card-header");
    const headerSkeletons = header.querySelectorAll('[data-slot="skeleton"]');
    expect(headerSkeletons.length).toBe(1);
  });

  it("renders multiple skeleton rows for transactions", () => {
    render(<TransactionListSkeleton />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // At least 3 rows × (icon + text + text + amount + badge) = 15+ skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("renders default 3 groups of skeleton rows", () => {
    render(<TransactionListSkeleton />);

    const content = screen.getByTestId("card-content");
    const contentSkeletons = content.querySelectorAll('[data-slot="skeleton"]');
    // Each group: 1 date header + 2 rows × (icon + text + text + amount + badge)
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(15);
  });

  it("accepts custom rows count", () => {
    render(<TransactionListSkeleton rows={5} />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(25);
  });

  it("applies custom className", () => {
    render(<TransactionListSkeleton className="custom-class" />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-class");
  });
});
