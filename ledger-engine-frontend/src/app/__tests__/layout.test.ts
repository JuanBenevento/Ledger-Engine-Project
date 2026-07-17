import { describe, it, expect } from "vitest";

// Test the metadata and viewport exports from layout.tsx — validates PWA configuration
describe("RootLayout PWA metadata", () => {
  it("exports metadata with PWA-compatible configuration", async () => {
    const layout = await import("@/app/layout");

    const metadata = layout.metadata;

    expect(metadata).toBeDefined();
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });

  it("includes keywords for discoverability", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.keywords).toBeDefined();
    expect(Array.isArray(metadata.keywords)).toBe(true);
    expect(metadata.keywords).toContain("billetera virtual");
  });

  it("includes manifest link for PWA", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.manifest).toBe("/manifest.json");
  });

  it("configures Open Graph tags", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe("Ledger Engine - Billetera Virtual");
    expect(metadata.openGraph?.locale).toBe("es_CO");
    expect(metadata.openGraph?.type).toBe("website");
  });

  it("configures Twitter Card tags", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe("Ledger Engine - Billetera Virtual");
  });

  it("disables telephone format detection", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.formatDetection).toBeDefined();
    expect(metadata.formatDetection?.telephone).toBe(false);
  });

  it("configures Apple Web App capable", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.appleWebApp).toBeDefined();
    expect(metadata.appleWebApp?.capable).toBe(true);
  });

  it("configures mobile-web-app-capable meta", async () => {
    const layout = await import("@/app/layout");
    const metadata = layout.metadata;

    expect(metadata.other).toBeDefined();
    expect(metadata.other?.["mobile-web-app-capable"]).toBe("yes");
  });

  it("exports viewport with PWA configuration", async () => {
    const layout = await import("@/app/layout");
    const viewport = layout.viewport;

    expect(viewport).toBeDefined();
    expect(viewport?.width).toBe("device-width");
    expect(viewport?.initialScale).toBe(1);
  });

  it("configures appleWebApp in viewport", async () => {
    const layout = await import("@/app/layout");
    const viewport = layout.viewport;

    expect(viewport?.appleWebApp).toBeDefined();
    expect(viewport?.appleWebApp?.capable).toBe(true);
    expect(viewport?.appleWebApp?.statusBarStyle).toBe("black-translucent");
  });
});
