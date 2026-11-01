import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "Tutor#Admin-2026";
const SECRET = process.env.ADMIN_SECRET ?? "tutor-admin-secret-change-me";
const COOKIE = "admin_token";

export const ADMIN_HINT = { login: LOGIN, password: PASSWORD };

/** Stateless-токен: HMAC(secret, login+password) — переживает рестарт процесса. */
export function adminToken(): string {
  return createHmac("sha256", SECRET).update(`${LOGIN}:${PASSWORD}`).digest("hex");
}

export function isAdmin(): boolean {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return false;
  const expected = adminToken();
  return t.length === expected.length && timingSafeEqual(Buffer.from(t), Buffer.from(expected));
}

export function setAdminCookie(): void {
  cookies().set(COOKIE, adminToken(), {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 12 * 3600, secure: process.env.NODE_ENV === "production",
  });
}

export function clearAdminCookie(): void {
  cookies().delete(COOKIE);
}

export function unauthorized(): Response {
  return Response.json({ error: "Требуется вход администратора" }, { status: 401 });
}
