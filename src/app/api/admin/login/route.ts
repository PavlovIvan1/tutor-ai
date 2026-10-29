import { NextRequest } from "next/server";
import { ADMIN_HINT, clearAdminCookie, setAdminCookie } from "@/lib/admin";

export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** POST: вход админа (login/password из env; дефолт admin / Tutor#Admin-2026). */
export async function POST(req: NextRequest) {
  const { login, password } = (await req.json().catch(() => ({}))) as {
    login?: string; password?: string;
  };
  if (!safeEqual(login ?? "", ADMIN_HINT.login) || !safeEqual(password ?? "", ADMIN_HINT.password)) {
    await new Promise((r) => setTimeout(r, 400)); // замедляем брутфорс
    return Response.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }
  setAdminCookie();
  return Response.json({ ok: true });
}

/** DELETE: выход админа. */
export async function DELETE() {
  clearAdminCookie();
  return Response.json({ ok: true });
}
