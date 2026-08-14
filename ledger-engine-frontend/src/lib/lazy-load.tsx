"use client";

import dynamic from "next/dynamic";
import type { DynamicOptionsLoadingProps } from "next/dynamic";
import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Default loading skeleton shown while a dynamic component loads.
 */
function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="space-y-2 mt-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

/**
 * Options for the lazyLoad utility.
 */
export interface LazyLoadOptions {
  /** Custom loading component (default: DefaultLoadingSkeleton) */
  loading?: (loadingProps: DynamicOptionsLoadingProps) => React.ReactElement | null;
  /** Whether to use SSR for this component (default: false) */
  ssr?: boolean;
}

/**
 * Wraps a component with next/dynamic for code splitting.
 *
 * Usage:
 * ```tsx
 * const HeavyComponent = lazyLoad(() => import("./heavy-component"));
 *
 * // With custom loading:
 * const HeavyComponent = lazyLoad(() => import("./heavy-component"), {
 *   loading: CustomSkeleton,
 * });
 * ```
 *
 * @param importFn - Dynamic import function
 * @param options - Optional loading component and SSR settings
 * @returns A lazily-loaded version of the component
 */
export function lazyLoad<P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: LazyLoadOptions
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options?.loading ?? DefaultLoadingSkeleton,
    ssr: options?.ssr ?? false,
  });
}
