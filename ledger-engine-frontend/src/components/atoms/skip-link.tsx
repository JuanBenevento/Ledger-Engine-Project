"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** The target element ID to skip to (default: "main-content") */
  target?: string;
  /** Custom text for the skip link */
  children?: string;
}

/**
 * Skip navigation link for keyboard users.
 * Hidden by default, becomes visible when focused via Tab key.
 * Allows keyboard users to bypass repetitive navigation and jump to main content.
 *
 * WCAG 2.4.1 — Bypass Blocks (Level A)
 */
export function SkipLink({
  target = "main-content",
  children = "Ir al contenido principal",
}: SkipLinkProps) {
  return (
    <a
      href={`#${target}`}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Visible when focused (keyboard navigation)
        "focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4",
        "focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2",
        "focus:rounded-md focus:font-medium focus:shadow-lg",
        // Remove default link styles
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      {children}
    </a>
  );
}
