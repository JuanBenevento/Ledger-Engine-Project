import { describe, it, expect } from "vitest";

// We test the config shape by importing the module and checking its structure.
// Since next.config.mjs uses plugins, we test the exported config properties.
describe("next.config.mjs optimizations", () => {
  it("exports a valid Next.js config object", async () => {
    // Import the config — it's wrapped by plugins but should still be an object
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  it("has reactStrictMode enabled", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.reactStrictMode).toBe(true);
  });

  it("has compress enabled", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.compress).toBe(true);
  });

  it("has image optimization with modern formats", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.images).toBeDefined();
    expect(config.images.formats).toContain("image/avif");
    expect(config.images.formats).toContain("image/webp");
  });

  it("has a long image cache TTL (30 days)", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
    expect(config.images.minimumCacheTTL).toBe(thirtyDaysInSeconds);
  });

  it("has remote image patterns configured", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.images.remotePatterns).toBeDefined();
    expect(config.images.remotePatterns.length).toBeGreaterThanOrEqual(2);
  });

  it("disables X-Powered-By header for security", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.poweredByHeader).toBe(false);
  });

  it("enables ETag generation for caching", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.generateEtags).toBe(true);
  });

  it("preserves API rewrite rules", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(typeof config.rewrites).toBe("function");
  });

  it("preserves server actions experimental config", async () => {
    const configModule = await import("../../next.config.mjs");
    const config = configModule.default;

    expect(config.experimental).toBeDefined();
    expect(config.experimental.serverActions).toBeDefined();
    expect(config.experimental.serverActions.bodySizeLimit).toBe("10mb");
  });
});
