"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface LoadingErrorProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Compact error display for data loading failures.
 * Designed for inline use within loading states.
 * Uses Spanish text.
 */
export function LoadingError({
  message,
  onRetry,
  isRetrying = false,
}: LoadingErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
    >
      <svg
        data-testid="error-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-destructive"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      <span className="flex-1 text-muted-foreground">{message}</span>
      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
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
