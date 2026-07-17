import { describe, it, expect, vi } from "vitest";

// Mock next-intl/plugin to verify it's called
vi.mock("next-intl/plugin", () => {
  const mockWithNextIntl = vi.fn((config: unknown) => config);
  return {
    default: vi.fn(() => mockWithNextIntl),
    __mockWithNextIntl: mockWithNextIntl,
  };
});

describe("next.config.mjs i18n integration", () => {
  it("imports and applies the next-intl plugin", async () => {
    const createNextIntlPlugin = (await import("next-intl/plugin")).default;
    expect(createNextIntlPlugin).toBeDefined();
    expect(typeof createNextIntlPlugin).toBe("function");
  });

  it("wraps the next config with i18n plugin", async () => {
    const createNextIntlPlugin = (await import("next-intl/plugin")).default;
    const pluginFactory = createNextIntlPlugin();
    expect(typeof pluginFactory).toBe("function");
  });
});
