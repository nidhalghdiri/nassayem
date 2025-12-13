import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["en", "ar"];
const defaultLocale = "en";

// Function to get locale from request headers
function getLocale(request) {
  try {
    // Get accept-language header
    const acceptLanguage =
      request.headers.get("accept-language") || "en-US,en;q=0.9";

    // Parse languages using negotiator
    const headers = { "accept-language": acceptLanguage };
    const languages = new Negotiator({ headers }).languages();

    // Match with available locales
    return match(languages, locales, defaultLocale);
  } catch (error) {
    console.error("Error detecting locale:", error);
    return defaultLocale;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log(`🔄 Middleware triggered for: ${pathname}`);

  // Skip middleware for:
  // 1. API routes
  // 2. Next.js internal routes
  // 3. Static files
  // 4. Favicon, sitemap, robots.txt
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") || // Files with extensions
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    console.log(`⏩ Skipping middleware for: ${pathname}`);
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    console.log(`✅ Path already has locale: ${pathname}`);
    return NextResponse.next();
  }

  // Get the preferred locale
  const locale = getLocale(request);
  console.log(`🌍 Detected locale: ${locale} for path: ${pathname}`);

  // Create the new URL with locale
  let newPathname = `/${locale}${pathname}`;
  if (pathname === "/") {
    newPathname = `/${locale}`;
  }

  const newUrl = new URL(newPathname, request.url);
  console.log(`🔀 Redirecting to: ${newUrl.toString()}`);

  // Perform the redirect
  return NextResponse.redirect(newUrl);
}

// **CRITICAL: This config was missing!**
export const config = {
  matcher: [
    // Match all paths except for:
    // 1. API routes (api/*)
    // 2. Static files (_next/static/*, static/*)
    // 3. Images, fonts, etc.
    // 4. Files with extensions (.js, .css, .png, etc.)
    // 5. Specific files (favicon.ico, sitemap.xml, robots.txt)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|fonts|public).*)",
  ],
};
