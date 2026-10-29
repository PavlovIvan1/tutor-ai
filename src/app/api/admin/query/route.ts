import { isAdmin, unauthorized } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST { sql } — консоль только для SELECT (PRAGMA для диагностики).
 * Муации — через gestion меню UI (удаление юзеров), а не сырым SQL.
 */
export async function POST(req: Request) {
  if (!isAdmin()) return unauthorized();
  const { sql } = (await req.json().catch(() => ({}))) as { sql?: string };
  const q = (sql ?? "").trim().replace(/;+$/, "");
  if (!q) return Response.json({ error: "Пустой запрос" }, { status: 400 });
  const head = q.slice(0, 7).toUpperCase();
  if (!head.startsWith("SELECT") && !head.startsWith("PRAGMA")) {
    return Response.json({ error: "Только SELECT / PRAGMA (чтение)" }, { status: 403 });
  }
  try {
    const stmt = getDb().prepare(q);
    const rows = stmt.all().slice(0, 500);
    const columns = stmt.columns().map((c) => c.name);
    void columns;
    const keys: string[] = rows.length ? Object.keys(rows[0] as Record<string, unknown>) : [];
    return Response.json({ columns: keys, rows, total: rows.length });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка SQL" },
      { status: 400 }
    );
  }
}
