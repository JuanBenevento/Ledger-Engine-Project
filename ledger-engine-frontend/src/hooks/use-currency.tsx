"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Format a number as COP currency.
 *
 * Format: $ 1.234.567 (punto separador miles, sin decimales)
 * Examples:
 *   1234567 → "$ 1.234.567"
 *   50000 → "$ 50.000"
 *   0 → "$ 0"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) {
    return "$ 0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return "$ 0";
  }

  // Format with Spanish locale (dots for thousands, no decimals)
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  // Intl.NumberFormat returns "$\u00a01.234.567" — we need "$ 1.234.567" (space after $)
  // Must replace the NBSP (U+00A0) that Intl.NumberFormat inserts between currency symbol and number
  return formatted.replace("$\u00a0", "$ ");
}

/**
 * Parse a COP formatted string back to number.
 *
 * "$ 1.234.567" → 1234567
 * "$ 50.000" → 50000
 */
export function parseCurrency(formatted: string): number {
  const cleaned = formatted.replace(/[$\s.]/g, "").replace(",", ".");
  return parseInt(cleaned, 10) || 0;
}

/**
 * Animated number component props.
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
}

/**
 * Animated number component that smoothly transitions between values.
 *
 * Used for balance display with subtle animation on changes.
 */
export function AnimatedNumber({
  value,
  duration = 500,
  className,
  prefix = "$ ",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationFrame = useRef<number>();

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
    previousValue.current = value;

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  const formatted = formatCurrency(displayValue);

  // Remove the default prefix since we're adding our own
  const display = prefix ? formatted.replace("$ ", prefix) : formatted;

  return <span className={className}>{display}</span>;
}

/**
 * Hook for currency formatting with locale awareness.
 *
 * Returns formatted value and helper functions.
 */
export function useCurrency() {
  const [locale] = useState("es-CO");

  const format = (amount: number | string | undefined | null) => {
    return formatCurrency(amount);
  };

  const formatWithDecimals = (
    amount: number | string | undefined | null,
    decimals: number = 2
  ) => {
    if (amount === undefined || amount === null) return "$ 0";

    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "$ 0";

    // Must replace the NBSP (U+00A0) that Intl.NumberFormat inserts between currency symbol and number
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num).replace("$\u00a0", "$ ");
  };

  const compact = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) return "$ 0";

    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "$ 0";

    if (num >= 1_000_000) {
      return `$ ${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `$ ${(num / 1_000).toFixed(1)}K`;
    }

    return formatCurrency(num);
  };

  return {
    format,
    formatWithDecimals,
    compact,
    parse: parseCurrency,
    locale,
  };
}
