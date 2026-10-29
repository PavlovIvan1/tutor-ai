import { isAdmin, unauthorized } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
const KEYS = ["transcribeModel", "homeworkModel"] as const;
type Data = Record<string, string>;

/** Глобальные модели по умолчанию: settings-строка user_id = 0 (система). */
function loadGlobal(): Data {
  const row = getDb().prepare("SELECT data FROM settings WHERE user_id = 0").get() as
    | { data: string }
    | undefined;
  try { return JSON.parse(row?.data ?? "{}"); } catch { return {}; }
}

export async function GET() {
  if (!isAdmin()) return unauthorized();
  return Response.json(loadGlobal());
}

export async function PUT(req: Request) {
  if (!isAdmin()) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as Data;
  const allowed: Data = {};
  for (const k of KEYS) if (typeof body[k] === "string") allowed[k] = body[k].slice(0, 120);
  getDb()
    .prepare(`INSERT INTO settings (user_id, data) VALUES (0, ?)
              ON CONFLICT(user_id) DO UPDATE SET data = excluded.data`)
    .run(JSON.stringify(allowed));
  return Response.json({ ok: true });
}
