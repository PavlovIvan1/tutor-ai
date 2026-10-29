import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const rows = getDb()
    .prepare(
      `SELECT id, name, level, notes, completed_topics, created_at FROM students
       WHERE user_id = ? ORDER BY id DESC`
    )
    .all(user.id) as { id: number; name: string; level: string; notes: string; completed_topics: string; created_at: string }[];
  return NextResponse.json(
    rows.map((r) => ({ ...r, completed_topics: safeParse(r.completed_topics) }))
  );
}

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

export async function POST(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const { name, surname, level } = (await req.json().catch(() => ({}))) as {
    name?: string; surname?: string; level?: string;
  };
  if (!name?.trim()) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  const fullName = `${name.trim()} ${surname?.trim() ?? ""}`.trim().slice(0, 100);
  const lvl = LEVELS.has(level ?? "") ? level! : "";
  const info = getDb()
    .prepare("INSERT INTO students (user_id, name, level) VALUES (?, ?, ?)")
    .run(user.id, fullName, lvl);
  return NextResponse.json({
    id: Number(info.lastInsertRowid), name: fullName, level: lvl, notes: "", completed_topics: [],
  });
}

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
