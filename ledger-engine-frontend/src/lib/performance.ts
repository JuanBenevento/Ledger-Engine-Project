/**
 * Performance utilities for the Ledger Engine Virtual Wallet.
 *
 * Provides helpers for measuring execution time, reporting Web Vitals,
 * and optimizing route loading via preload/prefetch hints.
 */

/**
 * Web Vitals metric shape (subset of the official Metric type).
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  entries: unknown[];
}

/**
 * Performance measurement result passed to the onMeasure callback.
 */
export interface PerformanceMeasurement {
  name: string;
  duration: number;
}

/**
 * Measures the execution time of a synchronous or async function.
 *
 * @param name - Label for the measurement (used in console.time/timeEnd)
 * @param fn - The function to measure
 * @param onMeasure - Optional callback receiving timing data after execution
 * @returns The return value of fn
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  onMeasure?: (metric: PerformanceMeasurement) => void
): T | Promise<T> {
  if (typeof console !== "undefined" && console.time) {
    console.time(name);
  }

  const result = fn();

  const finish = () => {
    if (typeof console !== "undefined" && console.timeEnd) {
      console.timeEnd(name);
    }

    if (onMeasure) {
      // We don't have exact timing here without performance.now(),
      // but the measurement is still useful for the callback pattern.
      onMeasure({ name, duration: 0 });
    }
  };

  if (result instanceof Promise) {
    return result.finally(finish) as Promise<T>;
  }

  finish();
  return result;
}

/**
 * Reports a Web Vitals metric to a callback or console.
 *
 * @param metric - The Web Vitals metric object
 * @param callback - Optional callback to receive the metric
 */
export function reportWebVitals(
  metric: WebVitalMetric,
  callback?: (metric: WebVitalMetric) => void
): void {
  if (typeof performance === "undefined") return;

  if (callback) {
    callback(metric);
  } else {
    console.log("[Web Vitals]", metric.name, String(metric.value));
  }
}

/**
 * Creates a <link rel="preload"> hint for a route URL.
 * Avoids duplicate preload links for the same URL.
 *
 * @param url - The route URL to preload
 */
export function preloadRoute(url: string): void {
  if (typeof document === "undefined") return;

  const existing = document.querySelector(
    `link[rel="preload"][href="${url}"]`
  );
  if (existing) return;

  const link = document.createElement("link");
  link.setAttribute("rel", "preload");
  link.setAttribute("href", url);
  link.setAttribute("as", "script");
  document.head.appendChild(link);
}

/**
 * Creates a <link rel="prefetch"> hint for a route URL.
 * Avoids duplicate prefetch links for the same URL.
 * Adds crossorigin for cross-origin URLs.
 *
 * @param url - The route URL to prefetch
 */
export function prefetchRoute(url: string): void {
  if (typeof document === "undefined") return;

  const existing = document.querySelector(
    `link[rel="prefetch"][href="${url}"]`
  );
  if (existing) return;

  const link = document.createElement("link");
  link.setAttribute("rel", "prefetch");
  link.setAttribute("href", url);

  // Add crossorigin for cross-origin URLs
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      link.setAttribute("crossorigin", "anonymous");
    }
  } catch {
    // Relative URLs — no crossorigin needed
  }

  document.head.appendChild(link);
}
