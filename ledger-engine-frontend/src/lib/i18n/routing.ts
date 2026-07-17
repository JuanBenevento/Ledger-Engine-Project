import { defineRouting } from "next-intl/routing";

/**
 * i18n routing configuration.
 *
 * Defines supported locales and default locale.
 * Spanish (es) is the default locale for the LATAM market.
 */
export const routing = defineRouting({
  locales: ["es"],
  defaultLocale: "es",
});
