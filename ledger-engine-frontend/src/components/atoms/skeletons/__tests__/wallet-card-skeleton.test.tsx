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
  CardHeader: ({ children, className }: any) =>
    React.createElement("div", { "data-testid": "card-header", className }, children),
  CardTitle: ({ children }: any) =>
    React.createElement("h3", { "data-testid": "card-title" }, children),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  WalletIcon: (props: any) => React.createElement("svg", { "data-testid": "wallet-icon", ...props }),
  ArrowRightIcon: (props: any) => React.createElement("svg", { "data-testid": "arrow-right-icon", ...props }),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { WalletCardSkeleton } from "../wallet-card-skeleton";

describe("WalletCardSkeleton", () => {
  it("renders a card container", () => {
    render(<WalletCardSkeleton />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders skeleton elements for balance, name, and badge", () => {
    render(<WalletCardSkeleton />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders a skeleton for wallet name in header", () => {
    render(<WalletCardSkeleton />);

    const header = screen.getByTestId("card-header");
    const headerSkeletons = header.querySelectorAll('[data-slot="skeleton"]');
    expect(headerSkeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a skeleton for balance amount", () => {
    render(<WalletCardSkeleton />);

    const content = screen.getByTestId("card-content");
    const contentSkeletons = content.querySelectorAll('[data-slot="skeleton"]');
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("applies custom className", () => {
    render(<WalletCardSkeleton className="custom-class" />);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-class");
  });
});
