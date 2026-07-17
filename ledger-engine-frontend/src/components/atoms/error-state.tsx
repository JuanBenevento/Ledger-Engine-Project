"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Reusable error display for data fetching sections.
 * Shows error icon, message, and optional retry button.
 * Uses Spanish text.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
    >
      <svg
        data-testid="error-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-destructive"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          aria-label={isRetrying ? "Reintentando" : "Reintentar"}
        >
          {isRetrying ? "Reintentando..." : "Reintentar"}
        </Button>
      )}
    </div>
  );
}
