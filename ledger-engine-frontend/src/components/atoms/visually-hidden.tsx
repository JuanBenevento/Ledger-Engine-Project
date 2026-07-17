"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** The element type to render as (default: "span") */
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Visually hidden content that remains accessible to screen readers.
 * Uses the "sr-only" pattern from Tailwind CSS.
 *
 * Useful for:
 * - Labeling icon-only buttons
 * - Providing context for screen readers
 * - Adding instructions that sighted users don't need
 *
 * WCAG 1.3.1 — Info and Relationships (Level A)
 */
export function VisuallyHidden({
  as: Component = "span",
  className,
  children,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        "sr-only",
        "focus:not-sr-only focus:absolute focus:z-[9999]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
