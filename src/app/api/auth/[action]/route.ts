import { NextRequest, NextResponse } from "next/server";
import { createSession, destroySession, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
type Ctx = { params: { action: string } };
type Body = { email?: string; password?: string; name?: string };

const BAD = { error: "Некорректный запрос" };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (ctx.params.action !== "me") return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ user: getSessionUser() });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const action = ctx.params.action;
  if (action === "logout") {
    destroySession();
    return NextResponse.json({ ok: true });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!emailValid(body.email) || !body.password || body.password.length < 6) {
    return NextResponse.json(
      { error: "Нужны email и пароль (минимум 6 символов)" }, { status: 400 });
  }
  const email = body.email!.trim().toLowerCase();
  const db = getDb();

  if (action === "register") {
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 409 });
    const name = (body.name?.trim() || email.split("@")[0]).slice(0, 80);
    const info = db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
      .run(email, name, hashPassword(body.password));
    createSession(Number(info.lastInsertRowid));
    return NextResponse.json({ user: { id: Number(info.lastInsertRowid), email, name } });
  }

  if (action === "login") {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
      { id: number; email: string; name: string; password_hash: string } | undefined;
    if (!user || !verifyPassword(body.password!, user.password_hash)) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }
    createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  }

  return NextResponse.json({ error: "Не найдено" }, { status: 404 });
}

function emailValid(email?: string): boolean {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
}
