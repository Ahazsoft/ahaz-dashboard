import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS } from "@/lib/auth/cookies";

// Protected routes
const PROTECTED_ROUTES = [
  "/dashboard",
  "/jobs",
  "/applicants",
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and auth API to be accessed without a token
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(.*)$/)

  ) {
    return NextResponse.next();
  }

  // Protect admin pages or specific protected routes
  if (pathname.startsWith("/admin") || isProtectedRoute(pathname)) {
    // accept cookie or Authorization header
    const cookieToken = req.cookies.get(COOKIE_ACCESS)?.value;
    const authHeader = req.headers.get("authorization") || "";
    const headerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    const accessToken = cookieToken ?? headerToken;

    if (!accessToken) {
      // For API routes return 401 JSON; for page routes redirect to login
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAccessToken(accessToken);

    if (!payload) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: "Token expired or invalid", code: "TOKEN_INVALID" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Inject user context into request headers for downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.sub!);
    requestHeaders.set("x-user-role", payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Default behavior for other routes
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
