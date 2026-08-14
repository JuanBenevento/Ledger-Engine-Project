import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";
import { formatCurrency, parseCurrency, AnimatedNumber, useCurrency } from "../use-currency";

describe("formatCurrency", () => {
  it('returns "$ 0" for undefined input', () => {
    expect(formatCurrency(undefined)).toBe("$ 0");
  });

  it('returns "$ 0" for null input', () => {
    expect(formatCurrency(null)).toBe("$ 0");
  });

  it('returns "$ 0" for NaN string input', () => {
    expect(formatCurrency("not-a-number")).toBe("$ 0");
  });

  it('formats 0 as "$ 0"', () => {
    expect(formatCurrency(0)).toBe("$ 0");
  });

  it('formats 50000 as "$ 50.000"', () => {
    expect(formatCurrency(50000)).toBe("$ 50.000");
  });

  it('formats 1234567 as "$ 1.234.567"', () => {
    expect(formatCurrency(1234567)).toBe("$ 1.234.567");
  });

  it('formats string "50000" as "$ 50.000"', () => {
    expect(formatCurrency("50000")).toBe("$ 50.000");
  });
});

describe("parseCurrency", () => {
  it('parses "$ 1.234.567" to 1234567', () => {
    expect(parseCurrency("$ 1.234.567")).toBe(1234567);
  });

  it('parses "$ 50.000" to 50000', () => {
    expect(parseCurrency("$ 50.000")).toBe(50000);
  });
});

describe("AnimatedNumber", () => {
  it('renders formatted value with default prefix "$ "', () => {
    render(<AnimatedNumber value={50000} />);
    expect(screen.getByText("$ 50.000")).toBeDefined();
  });

  it("renders custom prefix when provided", () => {
    render(<AnimatedNumber value={50000} prefix="USD " />);
    expect(screen.getByText("USD 50.000")).toBeDefined();
  });
});

describe("useCurrency", () => {
  it('returns correct locale "es-CO"', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.locale).toBe("es-CO");
  });

  it("format() returns same result as formatCurrency", () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.format(1234567)).toBe(formatCurrency(1234567));
  });

  it('compact() formats millions as "$ X.XM"', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.compact(1500000)).toBe("$ 1.5M");
  });

  it('compact() formats thousands as "$ X.XK"', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.compact(50000)).toBe("$ 50.0K");
  });
});
