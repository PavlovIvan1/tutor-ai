import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
type Ctx = { params: { id: string } };

interface Row {
  id: number;
  student_id: number;
  student_name: string;
  transcript: string;
  homework_md: string;
  created_at: string;
}

/** Урок доступен только владельцу ученика. */
async function owned(ctx: Ctx) {
  const user = getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Неавторизован" }, { status: 401 }) };
  const row = getDb()
    .prepare(
      `SELECT l.*, s.name AS student_name, s.user_id AS user_id
       FROM lessons l JOIN students s ON s.id = l.student_id WHERE l.id = ?`
    )
    .get(Number(ctx.params.id)) as (Row & { user_id: number }) | undefined;
  if (!row || row.user_id !== user.id) {
    return { error: NextResponse.json({ error: "Урок не найден" }, { status: 404 }) };
  }
  return { lesson: row };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { error, lesson } = await owned(ctx);
  if (error) return error;
  const l = lesson!;
  let topics: string[] = [];
  try {
    topics = JSON.parse(
      (getDb().prepare("SELECT completed_topics FROM students WHERE id = ?").get(l.student_id) as { completed_topics: string })
        .completed_topics
    );
  } catch {}
  return NextResponse.json({
    id: l.id, studentId: l.student_id, studentName: l.student_name, createdAt: l.created_at,
    transcript: l.transcript, homeworkMd: l.homework_md,
    completedTopics: Array.isArray(topics) ? topics : [],
  });
}

/** Обновление транскрипта и/или Markdown домашки урока. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await owned(ctx);
  if (error) return error;
  const body = (await req.json().catch(() => ({}))) as { transcript?: string; homeworkMd?: string };
  const sets: string[] = []; const vals: unknown[] = [];
  if (typeof body.transcript === "string") { sets.push("transcript = ?"); vals.push(body.transcript.slice(0, 60_000)); }
  if (typeof body.homeworkMd === "string") { sets.push("homework_md = ?"); vals.push(body.homeworkMd.slice(0, 100_000)); }
  if (!sets.length) return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  vals.push(Number(ctx.params.id));
  getDb().prepare(`UPDATE lessons SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await owned(ctx);
  if (error) return error;
  getDb().prepare("DELETE FROM lessons WHERE id = ?").run(Number(ctx.params.id));
  return NextResponse.json({ ok: true });
}
