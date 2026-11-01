import { NextResponse } from "next/server";
import { startOauth, yandexConfigured } from "@/lib/yandex";

export const runtime = "nodejs";

/** GET /api/auth/yandex -> редирект на OAuth-станицу Яндекса. */
export async function GET() {
  if (!yandexConfigured()) {
    return NextResponse.json(
      { error: "Вход через Яндекс не настроен: задайте YANDEX_CLIENT_ID и YANDEX_CLIENT_SECRET" },
      { status: 501 }
    );
  }
  return startOauth(NextResponse);
}
