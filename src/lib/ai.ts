import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * AI-провайдер сервиса.
 * Основной провайдер — Polza.ai (OpenAI-совместимый API, ключ pza_...):
 *   - транскрибация: POST {base}/audio/transcriptions (multipart, модель openai/whisper-large-v3-turbo)
 *   - генерация домашки: POST {base}/chat/completions
 *   - генерация картинок для заданий: POST {base}/images/generations (см. lib/mdDocx/image.ts)
 * Fallback — OpenRouter, если POLZA_API_KEY не задан (только совместимость со старыми деплоями).
 */

const POLZA_URL = "https://polza.ai/api/v1";
const OPENROUTER_URL = "https://openrouter.ai/api/v1";

export function aiProvider(): { base: string; key: string; kind: "polza" | "openrouter" } {
  const polzaKey = process.env.POLZA_API_KEY?.trim();
  if (polzaKey) return { base: POLZA_URL, key: polzaKey, kind: "polza" };
  return { base: OPENROUTER_URL, key: process.env.OPENROUTER_API_KEY ?? "", kind: "openrouter" };
}

/** Модели из настроек текущего пользователя (таблица settings), fallback — env. */
export function getSettingModels(): { transcribe: string; homework: string } {
  const fallback = {
    transcribe: process.env.TRANSCRIBE_MODEL || "openai/whisper-large-v3-turbo",
    homework: process.env.O3_MODEL || "openai/gpt-4o-mini",
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
  const h: Record<string, string> = { Authorization: `Bearer ${aiProvider().key}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

const EXT_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/flac": "flac",
};

/** Транскрипция аудио урока (Whisper). Polza — отдельный multipart-эндпоинт. */
export async function transcribeAudio(buf: Buffer, mime: string, model: string): Promise<string> {
  const p = aiProvider();

  if (p.kind === "polza") {
    const form = new FormData();
    const ext = EXT_BY_MIME[mime] ?? (mime.includes("ogg") ? "ogg" : "webm");
    form.append("file", new Blob([new Uint8Array(buf)], { type: mime }), `audio.${ext}`);
    form.append("model", model);
    const res = await fetch(`${p.base}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${p.key}` },
      body: form,
      signal: AbortSignal.timeout(110_000),
    });
    if (!res.ok) throw new Error(`Whisper error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { text?: string };
    return data?.text ?? "";
  }

  // OpenRouter: аудио внутри chat/completions (input_audio)
  const format = mime.includes("ogg") ? "ogg" : "webm";
  const res = await fetch(`${p.base}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this English lesson audio verbatim." },
            { type: "input_audio", input_audio: { data: buf.toString("base64"), format } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Whisper error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Генерация домашки: системный промпт (методичка) + юзерский запрос -> полный текст ответа. */
export async function callO3Mini(system: string, model: string): Promise<string> {
  const p = aiProvider();
  const res = await fetch(`${p.base}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Generate the homework now. Follow the output format exactly." },
      ],
      max_tokens: 8000,
    }),
    signal: AbortSignal.timeout(560_000),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}
