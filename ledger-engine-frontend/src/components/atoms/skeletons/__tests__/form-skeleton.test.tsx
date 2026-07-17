import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock Skeleton
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { FormSkeleton } from "../form-skeleton";

describe("FormSkeleton", () => {
  it("renders skeleton form fields", () => {
    render(<FormSkeleton />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders default 3 field groups", () => {
    render(<FormSkeleton />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // Each field: label skeleton + input skeleton = 2 per field
    // 3 fields + 1 button = at least 7 skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(7);
  });

  it("accepts custom fields count", () => {
    render(<FormSkeleton fields={5} />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // 5 fields × 2 (label + input) + 1 button = 11
    expect(skeletons.length).toBeGreaterThanOrEqual(11);
  });

  it("renders a skeleton for the submit button", () => {
    const { container } = render(<FormSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    const lastSkeleton = skeletons[skeletons.length - 1];
    expect(lastSkeleton).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<FormSkeleton className="custom-class" />);
    expect(container.firstChild).toHaveAttribute("class");
    expect(container.firstChild?.className).toContain("custom-class");
  });

  it("renders field groups with label and input skeletons each", () => {
    render(<FormSkeleton fields={2} />);

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // 2 fields × 2 (label + input) + 1 button = 5 minimum
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});
