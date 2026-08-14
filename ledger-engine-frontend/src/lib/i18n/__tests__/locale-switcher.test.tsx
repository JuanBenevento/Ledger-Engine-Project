import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "../../../../messages/es.json";
import { LocaleSwitcher } from "../locale-switcher";

// Mock the navigation hooks
vi.mock("@/lib/i18n/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderWithI18n(
  component: React.ReactNode,
  locale = "es"
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={esMessages}>
      {component}
    </NextIntlClientProvider>
  );
}

describe("LocaleSwitcher", () => {
  it("does not render when only one locale is available", () => {
    // With only "es" configured, the switcher should not render
    const { container } = renderWithI18n(<LocaleSwitcher />);
    expect(container.firstChild).toBeNull();
  });

  it("is exported from the i18n module", async () => {
    const mod = await import("../locale-switcher");
    expect(typeof mod.LocaleSwitcher).toBe("function");
  });
});
