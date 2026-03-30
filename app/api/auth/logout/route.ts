import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ACCESS, "", { maxAge: 0, path: "/" });
  res.cookies.set(COOKIE_REFRESH, "", { maxAge: 0, path: "/api/auth" });
  return res;
}
