import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * next-intl request configuration for Server Components.
 *
 * Provides the locale and messages to server-rendered components.
 * Reads locale from the request and loads the corresponding messages JSON.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is valid
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "es")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
