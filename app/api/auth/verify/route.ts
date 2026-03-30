import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS } from "@/lib/auth/cookies";

export async function GET(req: Request) {
  // Accept Bearer token or cookie named crm_access_token
  const authHeader = req.headers.get("authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  // Parse cookie header for token if present
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(new RegExp(`${COOKIE_ACCESS}=([^;]+)`));
  const cookieToken = cookieMatch ? cookieMatch[1] : undefined;

  const token = headerToken ?? cookieToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token expired or invalid", code: "TOKEN_INVALID" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, payload });
}
