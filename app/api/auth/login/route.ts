import { NextResponse } from "next/server";
import { signAccessToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create access token
    const token = await signAccessToken("admin", "admin", email);

    const res = NextResponse.json({ ok: true });
    // Set cookie — httpOnly, secure if production
    res.cookies.set(COOKIE_ACCESS, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
