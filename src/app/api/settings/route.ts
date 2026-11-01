import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

type Data = Record<string, string>;

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const row = getDb().prepare("SELECT data FROM settings WHERE user_id = ?").get(user.id) as
    | { data: string }
    | undefined;
  let data: Data = {};
  try { data = JSON.parse(row?.data ?? "{}"); } catch {}
  return NextResponse.json(data);
}

/** PUT: сохраняет настройки пользователя одним UPSERT-запросом. */
export async function PUT(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Data;
  const allowed: Data = {};
  for (const key of ["transcribeModel", "homeworkModel"] as const) {
    if (typeof body[key] === "string") allowed[key] = body[key].slice(0, 120);
  }
  getDb()
    .prepare(`INSERT INTO settings (user_id, data) VALUES (?, ?)
              ON CONFLICT(user_id) DO UPDATE SET data = excluded.data`)
    .run(user.id, JSON.stringify(allowed));
  return NextResponse.json({ ok: true });
}
