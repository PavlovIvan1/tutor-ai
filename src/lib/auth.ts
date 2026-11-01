import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export interface AuthUser { id: number; email: string; name: string }

const SESSION_DAYS = 30;
const COOKIE = "tutor_session";

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSession(userId: number): void {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  getDb().prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expires);
  cookies().set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: SESSION_DAYS * 86_400, secure: process.env.NODE_ENV === "production",
  });
}

export function destroySession(): void {
  const token = cookies().get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  cookies().delete(COOKIE);
}

export function getSessionUser(): AuthUser | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token) as AuthUser | undefined;
  return row ?? null;
}
