import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * i18n-aware navigation utilities.
 *
 * Wraps Next.js navigation components to support locale-prefixed routes.
 * Use these instead of next/link, next/navigation for all navigation.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
