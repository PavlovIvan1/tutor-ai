import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

interface Row {
  id: number;
  student_name: string;
  homework_md: string;
  transcript: string;
  created_at: string;
}

/** Список уроков пользователя с датами и статусом домашки. */
export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const rows = getDb()
    .prepare(
      `SELECT l.id, s.name AS student_name, l.transcript, l.homework_md, l.created_at
       FROM lessons l JOIN students s ON s.id = l.student_id
       WHERE s.user_id = ? ORDER BY l.id DESC LIMIT 200`
    )
    .all(user.id) as Row[];
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id, studentName: r.student_name, createdAt: r.created_at,
      hasHomework: Boolean(r.homework_md), hasTranscript: r.transcript.length > 0,
    }))
  );
}

/** Создание пустого урока (для заранее загруженного аудио). */
export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  const { studentId } = (await req.json().catch(() => ({}))) as { studentId?: number };
  if (!studentId) return NextResponse.json({ error: "studentId обязателен" }, { status: 400 });
  const db = getDb();
  const student = db
    .prepare("SELECT id FROM students WHERE id = ? AND user_id = ?")
    .get(studentId, user.id);
  if (!student) return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
  const info = db.prepare("INSERT INTO lessons (student_id) VALUES (?)").run(studentId);
  return NextResponse.json({ id: Number(info.lastInsertRowid) });
}
