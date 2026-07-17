import { describe, it, expect, vi } from "vitest";

// Mock next-intl/navigation since it depends on next/navigation
// which doesn't resolve in vitest/jsdom
vi.mock("next-intl/navigation", () => ({
  createNavigation: vi.fn(() => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
      null,
    redirect: vi.fn(),
    usePathname: vi.fn(() => "/"),
    useRouter: vi.fn(() => ({ replace: vi.fn() })),
  })),
}));

// Mock next-intl/server
vi.mock("next-intl/server", () => ({
  getRequestConfig: vi.fn((fn: unknown) => fn),
}));

describe("i18n barrel exports", () => {
  it("exports routing from the i18n module", async () => {
    const { routing } = await import("../routing");
    expect(routing).toBeDefined();
    expect(routing.locales).toEqual(["es"]);
    expect(routing.defaultLocale).toBe("es");
  });

  it("exports navigation utilities from the i18n module", async () => {
    const nav = await import("../navigation");
    expect(typeof nav.Link).toBe("function");
    expect(typeof nav.redirect).toBe("function");
    expect(typeof nav.usePathname).toBe("function");
    expect(typeof nav.useRouter).toBe("function");
  });

  it("exports requestConfig from the i18n module", async () => {
    const { default: requestConfig } = await import("../request");
    expect(typeof requestConfig).toBe("function");
  });
});
