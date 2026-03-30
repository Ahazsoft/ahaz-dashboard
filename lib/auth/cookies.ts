import { cookies } from "next/headers";

const IS_PROD = process.env.NODE_ENV === "production";

export const COOKIE_ACCESS = "crm_access_token";
export const COOKIE_REFRESH = "crm_refresh_token";

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_ACCESS, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set(COOKIE_REFRESH, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/api/auth", // scoped to refresh endpoint only
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ACCESS);
  cookieStore.delete(COOKIE_REFRESH);
}

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_ACCESS)?.value;
}

export async function getRefreshTokenFromCookies(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_REFRESH)?.value;
}
