import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Шаг 1 входа через Yandex ID: редирект на oauth.yandex.ru
 * с CSRF-стейтом в httpOnly cookie.
 */
export function yandexConfigured(): boolean {
  return Boolean(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET);
}

export function redirectUri(): string {
  return `${process.env.APP_URL ?? "http://localhost:3000"}/auth/yandex/callback`;
}

export function startOauth(res: typeof NextResponse): NextResponse {
  const state = randomBytes(16).toString("hex");
  cookies().set("ya_state", state, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax" });
  const url = new URL("https://oauth.yandex.ru/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.YANDEX_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("force_confirm", "yes");
  return NextResponse.redirect(url.toString());
}

/** Шаг 2: обмен code на токен. */
export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.YANDEX_CLIENT_ID ?? "",
      client_secret: process.env.YANDEX_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(),
    }),
  });
  if (!res.ok) throw new Error(`Yandex token error ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Профиль пользователя Yandex ID: login (email), display_name, default_avatar_id. */
export async function fetchYandexUser(token: string): Promise<{ email: string; name: string; yandexId: string }> {
  const res = await fetch(`https://login.yandex.ru/info?oauth_token=${token}`, {
    headers: { Authorization: `OAuth ${token}` },
  });
  if (!res.ok) throw new Error(`Yandex info error ${res.status}`);
  const u = (await res.json()) as {
    login: string; display_name?: string; default_avatar_id?: string; psuid?: string;
  };
  return {
    email: u.login.includes("@") ? u.login : `${u.login}@yandex.ru`,
    name: u.display_name || u.login,
    yandexId: u.psuid ?? u.default_avatar_id ?? u.login,
  };
}
