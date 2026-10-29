import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const OPENROUTER_URL = "https://openrouter.ai/api/v1";

/** Модели из настроек текущего пользователя (таблица settings), fallback — env. */
export function getSettingModels(): { transcribe: string; homework: string } {
  const fallback = {
    transcribe: process.env.TRANSCRIBE_MODEL || "openai/whisper-large-v3-turbo",
    homework: process.env.O3_MODEL || "openai/o3-mini",
  };
  // 1) личные настройки пользователя, 2) глобальные настройки админа (user_id=0), 3) env
  const user = getSessionUser();
  if (user) {
    const mine = readSettings(user.id);
    if (mine.transcribeModel || mine.homeworkModel) {
      return {
        transcribe: mine.transcribeModel || fallback.transcribe,
        homework: mine.homeworkModel || fallback.homework,
      };
    }
  }
  const global = readSettings(0);
  return {
    transcribe: global.transcribeModel || fallback.transcribe,
    homework: global.homeworkModel || fallback.homework,
  };
}

function readSettings(userId: number): Record<string, string> {
  try {
    const row = getDb().prepare("SELECT data FROM settings WHERE user_id = ?").get(userId) as
      | { data: string }
      | undefined;
    return JSON.parse(row?.data ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function headers(json = true) {
  const h: Record<string, string> = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
    "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/** Транскрипция аудио через OpenRouter (input_audio). */
export async function transcribeAudio(base64: string, mime: string, model: string): Promise<string> {
  const format = mime.includes("ogg") ? "ogg" : "webm";
  const res = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this English lesson audio verbatim." },
            { type: "input_audio", input_audio: { data: base64, format } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Whisper error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Генерация домашки: o3-mini — возврат полного текста ответа. */
export async function callO3Mini(system: string, model: string): Promise<string> {
  const res = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: system }],
      max_tokens: 4000,
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}
