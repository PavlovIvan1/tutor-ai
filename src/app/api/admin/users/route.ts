import { isAdmin, unauthorized } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

interface Row {
  id: number; email: string; name: string; created_at: string;
  students: number; lessons: number; yandex_id: string;
}

/** GET: все пользователи со счетчиками их данных. */
export async function GET() {
  if (!isAdmin()) return unauthorized();
  const rows = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.created_at, u.yandex_id,
              (SELECT COUNT(*) FROM students s WHERE s.user_id = u.id) students,
              (SELECT COUNT(*) FROM lessons l JOIN students s2 ON s2.id = l.student_id WHERE s2.user_id = u.id) lessons
       FROM users u ORDER BY u.id DESC LIMIT 500`
    )
    .all() as Row[];
  return Response.json(
    rows.map((r) => ({ ...r, viaYandex: Boolean(r.yandex_id) }))
  );
}

/** DELETE ?id=: удалить пользователя и все его данные (каскад). */
export async function DELETE(req: Request) {
  if (!isAdmin()) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Некорректный id" }, { status: 400 });
  }
  const info = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
  return Response.json({ deleted: info.changes > 0 });
}
