import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  measurePerformance,
  reportWebVitals,
  preloadRoute,
  prefetchRoute,
} from "../performance";

describe("performance utilities", () => {
  describe("measurePerformance", () => {
    it("returns the result of the wrapped function", () => {
      const result = measurePerformance("test-op", () => 42);

      expect(result).toBe(42);
    });

    it("returns the result of an async wrapped function", async () => {
      const result = await measurePerformance("async-op", async () => {
        return "hello";
      });

      expect(result).toBe("hello");
    });

    it("passes through errors thrown by the wrapped function", () => {
      expect(() =>
        measurePerformance("failing-op", () => {
          throw new Error("boom");
        })
      ).toThrow("boom");
    });

    it("measures execution time via console.time/timeEnd in development", () => {
      const timeSpy = vi.spyOn(console, "time").mockImplementation(() => {});
      const timeEndSpy = vi
        .spyOn(console, "timeEnd")
        .mockImplementation(() => {});

      measurePerformance("my-label", () => 1 + 1);

      expect(timeSpy).toHaveBeenCalledWith("my-label");
      expect(timeEndSpy).toHaveBeenCalledWith("my-label");

      timeSpy.mockRestore();
      timeEndSpy.mockRestore();
    });

    it("calls the optional onMeasure callback with timing data", () => {
      const onMeasure = vi.fn();

      measurePerformance(
        "cb-test",
        () => {
          return 100;
        },
        onMeasure
      );

      expect(onMeasure).toHaveBeenCalledOnce();
      const [metric] = onMeasure.mock.calls[0];
      expect(metric.name).toBe("cb-test");
      expect(typeof metric.duration).toBe("number");
      expect(metric.duration).toBeGreaterThanOrEqual(0);
    });

    it("works with functions that have side effects", () => {
      let counter = 0;
      const result = measurePerformance("side-effect", () => {
        counter += 1;
        return counter;
      });

      expect(result).toBe(1);
      expect(counter).toBe(1);
    });
  });

  describe("reportWebVitals", () => {
    it("calls the callback with the metric object", () => {
      const callback = vi.fn();
      const metric = {
        name: "LCP",
        value: 2500,
        rating: "good" as const,
        delta: 2500,
        id: "lcp-1",
        entries: [],
      };

      reportWebVitals(metric, callback);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(metric);
    });

    it("does not throw when callback is not provided", () => {
      const metric = {
        name: "FID",
        value: 50,
        rating: "good" as const,
        delta: 50,
        id: "fid-1",
        entries: [],
      };

      expect(() => reportWebVitals(metric)).not.toThrow();
    });

    it("does not throw when performance API is unavailable (SSR)", () => {
      const originalPerformance = globalThis.performance;
      // @ts-expect-error - Intentionally deleting for SSR simulation
      delete globalThis.performance;

      const metric = {
        name: "CLS",
        value: 0.1,
        rating: "good" as const,
        delta: 0.1,
        id: "cls-1",
        entries: [],
      };

      expect(() => reportWebVitals(metric)).not.toThrow();

      globalThis.performance = originalPerformance;
    });

    it("reports to console when no callback is provided and performance is available", () => {
      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const metric = {
        name: "TTFB",
        value: 100,
        rating: "good" as const,
        delta: 100,
        id: "ttfb-1",
        entries: [],
      };

      reportWebVitals(metric);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Web Vitals]",
        "TTFB",
        "100"
      );

      consoleSpy.mockRestore();
    });

    it("handles all web vital types without throwing", () => {
      const vitalNames = ["LCP", "FID", "CLS", "TTFB", "INP", "FCP"];

      for (const name of vitalNames) {
        const metric = {
          name,
          value: Math.random() * 1000,
          rating: "good" as const,
          delta: 10,
          id: `${name.toLowerCase()}-test`,
          entries: [],
        };

        expect(() => reportWebVitals(metric, vi.fn())).not.toThrow();
      }
    });
  });

  describe("preloadRoute", () => {
    beforeEach(() => {
      // Clean up any existing preload links
      document.querySelectorAll('link[rel="preload"]').forEach((el) => {
        el.parentNode?.removeChild(el);
      });
    });

    it("creates a preload link element in the document head", () => {
      preloadRoute("/dashboard");

      const link = document.querySelector('link[rel="preload"][href="/dashboard"]');
      expect(link).toBeInTheDocument();
    });

    it("sets the correct as attribute for script", () => {
      preloadRoute("/wallets");

      const link = document.querySelector(
        'link[rel="preload"][href="/wallets"]'
      );
      expect(link).toHaveAttribute("as", "script");
    });

    it("does not create duplicate preload links for the same URL", () => {
      preloadRoute("/bills");
      preloadRoute("/bills");

      const links = document.querySelectorAll(
        'link[rel="preload"][href="/bills"]'
      );
      expect(links).toHaveLength(1);
    });

    it("creates separate preload links for different URLs", () => {
      preloadRoute("/route-a");
      preloadRoute("/route-b");

      const linkA = document.querySelector(
        'link[rel="preload"][href="/route-a"]'
      );
      const linkB = document.querySelector(
        'link[rel="preload"][href="/route-b"]'
      );
      expect(linkA).toBeInTheDocument();
      expect(linkB).toBeInTheDocument();
    });

    it("does not throw in SSR environment", () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error - Intentionally setting to undefined for SSR simulation
      globalThis.document = undefined;

      expect(() => preloadRoute("/ssr-route")).not.toThrow();

      globalThis.document = originalDocument;
    });
  });

  describe("prefetchRoute", () => {
    beforeEach(() => {
      // Clean up any existing prefetch links
      document.querySelectorAll('link[rel="prefetch"]').forEach((el) => {
        el.parentNode?.removeChild(el);
      });
    });

    it("creates a prefetch link element in the document head", () => {
      prefetchRoute("/transfer");

      const link = document.querySelector(
        'link[rel="prefetch"][href="/transfer"]'
      );
      expect(link).toBeInTheDocument();
    });

    it("does not create duplicate prefetch links for the same URL", () => {
      prefetchRoute("/topup");
      prefetchRoute("/topup");

      const links = document.querySelectorAll(
        'link[rel="prefetch"][href="/topup"]'
      );
      expect(links).toHaveLength(1);
    });

    it("creates separate prefetch links for different URLs", () => {
      prefetchRoute("/prefetch-a");
      prefetchRoute("/prefetch-b");

      const linkA = document.querySelector(
        'link[rel="prefetch"][href="/prefetch-a"]'
      );
      const linkB = document.querySelector(
        'link[rel="prefetch"][href="/prefetch-b"]'
      );
      expect(linkA).toBeInTheDocument();
      expect(linkB).toBeInTheDocument();
    });

    it("does not throw in SSR environment", () => {
      const originalDocument = globalThis.document;
      // @ts-expect-error - Intentionally setting to undefined for SSR simulation
      globalThis.document = undefined;

      expect(() => prefetchRoute("/ssr-prefetch")).not.toThrow();

      globalThis.document = originalDocument;
    });

    it("sets the crossorigin attribute for cross-origin URLs", () => {
      prefetchRoute("https://cdn.example.com/assets/chunk.js");

      const link = document.querySelector(
        'link[rel="prefetch"][href="https://cdn.example.com/assets/chunk.js"]'
      );
      expect(link).toHaveAttribute("crossorigin", "anonymous");
    });

    it("does not set crossorigin for same-origin URLs", () => {
      prefetchRoute("/same-origin");

      const link = document.querySelector(
        'link[rel="prefetch"][href="/same-origin"]'
      );
      expect(link).not.toHaveAttribute("crossorigin");
    });
  });
});
