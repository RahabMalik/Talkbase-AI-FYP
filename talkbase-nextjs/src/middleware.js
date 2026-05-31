/**
 * src/middleware.js
 *
 * FIX APPLIED
 * ───────────
 * Removed /reset-password from the GUEST_ONLY list.
 *
 * Problem: A logged-in user who clicks "Forgot password?" was silently
 * redirected to /dashboard instead of reaching the reset page.  This is
 * because /reset-password was in GUEST_ONLY, so any request carrying a
 * valid auth cookie was bounced away before the page could load.
 *
 * /reset-password is a token-based, stateless page — there is no reason
 * to block authenticated users from visiting it.  The token in the query
 * string is the only credential that matters.
 *
 * /forgot-password remains in GUEST_ONLY because it is only reachable
 * via the login/signup forms and there is no benefit to an authenticated
 * user visiting it (they can change their password from Settings).
 */

import { NextResponse } from "next/server";

// Routes that require a logged-in user
const PROTECTED = [
  "/dashboard",
  "/analytics",
  "/faq",
  "/FAQ",
  "/settings",
  "/widget-settings",
  "/ingestion",
];

// Routes only for guests (redirect to dashboard if already logged in).
// NOTE: /reset-password is intentionally NOT in this list — a logged-in
// user may still need to follow a password-reset link from their email.
const GUEST_ONLY = ["/login", "/signup", "/forgot-password"];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p));

  // Not logged in → trying to access protected page → send to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → trying to access login/signup → send to dashboard
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/faq/:path*",
    "/FAQ/:path*",
    "/settings/:path*",
    "/widget-settings/:path*",
    "/ingestion/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
