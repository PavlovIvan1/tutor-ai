import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const NAME_MAX = 80;

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  return NextResponse.json({ name: user.name, email: user.email });
}

/** PUT: обновление имени профиля текущего пользователя. */
export async function PUT(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  if (!name?.trim()) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  getDb()
    .prepare("UPDATE users SET name = ? WHERE id = ?")
    .run(name.trim().slice(0, NAME_MAX), user.id);
  return NextResponse.json({ ok: true, name: name.trim() });
}
