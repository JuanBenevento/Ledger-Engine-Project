import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Combined middleware: i18n locale detection + route protection.
 *
 * 1. next-intl handles locale detection and routing
 * 2. Additional route protection for authenticated routes
 *
 * Note: This is a basic middleware. Full Keycloak token validation
 * happens server-side in API routes. This middleware provides
 * a fast client-side redirect for better UX.
 */

// Routes that require authentication (without locale prefix)
const protectedRoutes = [
  "/dashboard",
  "/wallets",
  "/topup",
  "/transfer",
  "/qr",
  "/bills",
  "/notifications",
  "/security",
  "/kyc",
];

// Routes that are public (no auth required, without locale prefix)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/verify-phone",
];

// Admin-only routes
const adminRoutes = ["/admin"];

// Merchant-only routes
const merchantRoutes = ["/merchant"];

/**
 * Strip locale prefix from pathname.
 * e.g., "/es/dashboard" → "/dashboard"
 */
function stripLocale(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname.startsWith(prefix + "/") || pathname === prefix) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname;
}

const handleI18nRouting = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run i18n routing first
  const i18nResponse = handleI18nRouting(request);

  // If i18n middleware already redirects (e.g., to add locale), use that response
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse;
  }

  // Extract locale from pathname for route protection checks
  const localeMatch = pathname.match(/^\/(es)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : null;
  const basePath = locale ? stripLocale(pathname, locale) : pathname;

  // Check for session cookie (set by Keycloak)
  const sessionCookie = request.cookies.get("KEYCLOAK_SESSION");
  const isAuthenticated = !!sessionCookie;

  // Allow public routes
  if (publicRoutes.some((route) => basePath.startsWith(route))) {
    if (
      isAuthenticated &&
      (basePath === "/login" || basePath === "/register")
    ) {
      const redirectPath = locale ? `/${locale}/dashboard` : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return i18nResponse;
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    basePath.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginPath = locale ? `/${locale}/login` : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some((route) =>
    basePath.startsWith(route)
  );

  if (isAdminRoute && !isAuthenticated) {
    const loginPath = locale ? `/${locale}/login` : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // Check merchant routes
  const isMerchantRoute = merchantRoutes.some((route) =>
    basePath.startsWith(route)
  );

  if (isMerchantRoute && !isAuthenticated) {
    const loginPath = locale ? `/${locale}/login` : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return i18nResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled by rewrites)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
