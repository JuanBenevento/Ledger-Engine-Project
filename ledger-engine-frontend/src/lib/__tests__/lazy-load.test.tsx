import { describe, it, expect, vi } from "vitest";
import { lazyLoad } from "../lazy-load";

// Mock next/dynamic
vi.mock("next/dynamic", () => {
  return {
    default: vi.fn((importFn: () => Promise<{ default: React.ComponentType }>, options: Record<string, unknown>) => {
      // Return a component that renders a data attribute indicating it was dynamically loaded
      const MockDynamic = (props: Record<string, unknown>) => {
        return null;
      };
      MockDynamic.displayName = `Lazy(${options?.loading ? "CustomLoading" : "DefaultLoading"})`;
      return MockDynamic;
    }),
  };
});

describe("lazyLoad utility", () => {
  it("returns a component (function)", () => {
    const LazyComponent = lazyLoad(() => Promise.resolve({ default: () => null }));

    expect(typeof LazyComponent).toBe("function");
  });

  it("calls next/dynamic with the import function", async () => {
    const dynamic = await import("next/dynamic");
    const mockDynamic = vi.mocked(dynamic.default);

    const importFn = () => Promise.resolve({ default: () => null });
    lazyLoad(importFn);

    expect(mockDynamic).toHaveBeenCalledWith(
      importFn,
      expect.objectContaining({
        ssr: false,
      })
    );
  });

  it("passes ssr: false by default", async () => {
    const dynamic = await import("next/dynamic");
    const mockDynamic = vi.mocked(dynamic.default);

    lazyLoad(() => Promise.resolve({ default: () => null }));

    expect(mockDynamic).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ ssr: false })
    );
  });

  it("passes ssr: true when explicitly set", async () => {
    const dynamic = await import("next/dynamic");
    const mockDynamic = vi.mocked(dynamic.default);

    lazyLoad(() => Promise.resolve({ default: () => null }), { ssr: true });

    expect(mockDynamic).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ ssr: true })
    );
  });

  it("passes custom loading component when provided", async () => {
    const dynamic = await import("next/dynamic");
    const mockDynamic = vi.mocked(dynamic.default);

    const CustomLoading = () => null;
    lazyLoad(() => Promise.resolve({ default: () => null }), {
      loading: CustomLoading,
    });

    expect(mockDynamic).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ loading: CustomLoading })
    );
  });
});
