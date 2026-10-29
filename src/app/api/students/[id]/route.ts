import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
type Ctx = { params: { id: string } };

interface Row {
  id: number;
  user_id: number;
  name: string;
  notes: string;
  completed_topics: string;
  created_at: string;
}

/** 404-подход скрывает чужие записи (нет утечки по id). */
async function owned(ctx: Ctx) {
  const user = getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Неавторизован" }, { status: 401 }) };
  const row = getDb().prepare("SELECT * FROM students WHERE id = ?").get(Number(ctx.params.id)) as Row | undefined;
  if (!row || row.user_id !== user.id) {
    return { error: NextResponse.json({ error: "Ученик не найден" }, { status: 404 }) };
  }
  return { student: row };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { error, student } = await owned(ctx);
  if (error) return error;
  let topics: string[] = [];
  try { topics = JSON.parse(student!.completed_topics); } catch {}
  return NextResponse.json({
    id: student!.id, name: student!.name, notes: student!.notes,
    completed_topics: Array.isArray(topics) ? topics : [],
  });
}

/**
 * БАТЧ-апдейт контекста: notes и completed_topics одним UPDATE.
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await owned(ctx);
  if (error) return error;
  const body = (await req.json().catch(() => ({}))) as { notes?: string; completedTopics?: string[] };
  const sets: string[] = []; const vals: unknown[] = [];
  if (typeof body.notes === "string") { sets.push("notes = ?"); vals.push(body.notes.slice(0, 20_000)); }
  if (Array.isArray(body.completedTopics)) {
    sets.push("completed_topics = ?"); vals.push(JSON.stringify(body.completedTopics.slice(-100)));
  }
  if (!sets.length) return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  vals.push(Number(ctx.params.id));
  getDb().prepare(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await owned(ctx);
  if (error) return error;
  getDb().prepare("DELETE FROM students WHERE id = ?").run(Number(ctx.params.id));
  return NextResponse.json({ ok: true });
}
