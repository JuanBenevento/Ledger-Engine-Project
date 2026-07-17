"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

/**
 * LocaleSwitcher component.
 *
 * Dropdown to switch between available locales.
 * Currently only supports Spanish (es), but prepared for future locales.
 *
 * Uses next-intl's routing to handle locale switching.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Common");

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Only render if there are multiple locales
  if (routing.locales.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-switcher" className="text-sm text-muted-foreground">
        {t("search")}:
      </label>
      <select
        id="locale-switcher"
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="rounded border bg-background px-2 py-1 text-sm"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
