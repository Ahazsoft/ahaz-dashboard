// middleware.ts (or wherever your middleware is defined)
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS } from "@/lib/auth/cookies";

const BACKEND_VERIFY_URL = "https://backend.ahaz.io/api/auth/verify";
// const BACKEND_VERIFY_URL = "http://localhost:3001/api/auth/verify";

// Protected routes (same as before)
const PROTECTED_ROUTES = ["/dashboard", "/jobs", "/applicants"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths without token
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Only protect admin pages or explicitly protected routes
  if (pathname.startsWith("/admin") || isProtectedRoute(pathname)) {
    // Extract token from cookie or Authorization header
    const cookieToken = req.cookies.get(COOKIE_ACCESS)?.value;
    const authHeader = req.headers.get("authorization") || "";
    const headerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const accessToken = cookieToken ?? headerToken;

    if (!accessToken) {
      // No token → unauthorized
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Call the external backend verify endpoint
    try {
      const verifyRes = await fetch(BACKEND_VERIFY_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // No need to forward cookies because we send the token in Authorization header
      });

      if (!verifyRes.ok) {
        // Token invalid or expired
        if (pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "Token expired or invalid", code: "TOKEN_INVALID" },
            { status: 401 }
          );
        }
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Verification successful – we can optionally extract payload from response
      const { payload } = await verifyRes.json();

      // Inject user info into headers for downstream handlers (optional)
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", payload.userId || payload.sub);
      requestHeaders.set("x-user-email", payload.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      // Backend unreachable or network error – treat as unauthorized
      console.error("Auth verify request failed:", err);
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Authentication service unavailable" },
          { status: 503 }
        );
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Default: allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/jobs/:path*",
    "/jobs",
    "/applicants/:path*",
    "/applicants",
  ],
};  