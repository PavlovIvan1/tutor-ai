import { cookies } from "next/headers";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { exchangeCode, fetchYandexUser } from "@/lib/yandex";

export const runtime = "nodejs";

/**
 * POST { code } — обмен кода на токен, поиск/создание юзера, создание сессии.
 * Рассылка передается флагом и хранится в notes disabled... (см. mailing)
 */
export async function POST(req: Request) {
  try {
    const { code, state, mailing } = (await req.json()) as { code?: string; state?: string; mailing?: boolean };
    if (!code) return Response.json({ error: "Нет кода авторизации" }, { status: 400 });

    const expected = cookies().get("ya_state")?.value;
    if (!expected || expected !== state) {
      return Response.json({ error: "Неверный CSRF-стейт" }, { status: 403 });
    }
    const ya = await fetchYandexUser(await exchangeCode(code));

    const db = getDb();
    let user = db.prepare("SELECT * FROM users WHERE yandex_id = ? OR email = ?").get(ya.yandexId, ya.email) as
      | { id: number; email: string; name: string }
      | undefined;

    if (!user) {
      const info = db.prepare("INSERT INTO users (email, name, password_hash, yandex_id) VALUES (?, ?, '', ?)")
        .run(ya.email, ya.name, ya.yandexId);
      user = { id: Number(info.lastInsertRowid), email: ya.email, name: ya.name };
      if (mailing) {
        db.prepare("INSERT INTO settings (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO NOTHING")
          .run(user.id, "{}");
      }
    } else {
      db.prepare("UPDATE users SET yandex_id = ? WHERE id = ? AND yandex_id = ''").run(ya.yandexId, user.id);
    }

    createSession(user.id);
    return Response.json({ user });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Ошибка входа через Яндекс" },
      { status: 502 }
    );
  }
}