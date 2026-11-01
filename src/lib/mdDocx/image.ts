import crypto from "crypto";
import { extractImagePrompts } from "@/lib/parse";

const CACHE_LIMIT = 20;
const POLZA_API = "https://polza.ai/api";

/**
 * Генерация картинок для заданий с картинкой.
 * Основной источник — Polza.ai:
 *   1) POST /api/v2/images/generations (синхронный, OpenAI-формат) — основной путь;
 *   2) если ответ пришёл async вида {"requestId": "..."} (201) — polling
 *      GET /api/v1/media/{id} раз в 4 с (статусы pending/processing/completed/failed).
 * Fallback — pollinations.ai (GET без ключа), если Polza не ответил/ключ не задан.
 * Кэш в памяти ограничен LRU-подобным срезом, чтобы не раздувать RAM.
 */
const cache = new Map<string, { data: Buffer; ext: number }>();

export interface ImageProps {
  data: Buffer;
  transformation: { width: number; height: number; type: "png" };
}

export async function fetchTaskImage(prompt: string): Promise<{ props: ImageProps } | null> {
  try {
    const cached = cache.get(prompt);
    if (cached) return { props: buildProps(cached.data) };

    const data = (await polzaImage(prompt)) ?? (await pollinationsImage(prompt));
    if (!data) return null;

    cache.set(prompt, { data, ext: Date.now() });
    if (cache.size > CACHE_LIMIT) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ext - b[1].ext)[0];
      if (oldest) cache.delete(oldest[0]);
    }
    return { props: buildProps(data) };
  } catch {
    return null; // картинка не критична: в docx уйдёт текстовая метка
  }
}

/** Генерация через Polza.ai: синхронный /v2, при async-ответе — polling /v1/media. */
async function polzaImage(prompt: string): Promise<Buffer | null> {
  const key = process.env.POLZA_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.AI_IMAGE_MODEL?.trim() || "x-ai/grok-imagine-image";

  const res = await fetch(`${POLZA_API}/v2/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1, response_format: "url" }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) return null;

  const body = (await res.json().catch(() => null)) as
    | { data?: Array<{ url?: string; b64_json?: string }>; requestId?: string }
    | null;

  // Синхронный ответ: сразу ссылки
  const item = body?.data?.[0];
  if (item?.url) return download(item.url);
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");

  // Async-ответ (201 {"requestId"}): ждём готовности по статусу
  if (body?.requestId) return pollMedia(body.requestId, key);
  return null;
}

/** Опрос статуса генерации: GET /v1/media/{id} каждые 4 с, максимум ~90 с. */
async function pollMedia(id: string, key: string): Promise<Buffer | null> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${POLZA_API}/v1/media/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const s = (await res.json().catch(() => null)) as
      | { status?: string; data?: { url?: string } | Array<{ url?: string }> }
      | null;
    if (!s) return null;

    if (s.status === "completed") {
      const d = Array.isArray(s.data) ? s.data[0] : s.data;
      return d?.url ? download(d.url) : null;
    }
    if (s.status === "failed" || s.status === "cancelled") return null;

    await new Promise((r) => setTimeout(r, 4_000));
  }
  return null;
}

async function download(url: string): Promise<Buffer | null> {
  const img = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!img.ok) return null;
  return Buffer.from(await img.arrayBuffer());
}

/** Бесплатный fallback: pollinations.ai (GET без ключа). */
async function pollinationsImage(prompt: string): Promise<Buffer | null> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=384&nologo=true&seed=${seedFrom(prompt)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

function buildProps(data: Buffer): ImageProps {
  return {
    data,
    transformation: { width: 512, height: 384, type: "png" as const },
  };
}
function seedFrom(prompt: string): number {
  const hash = crypto.createHash("md5").update(prompt).digest("hex");
  return parseInt(hash.slice(0, 8), 16) % 100000;
}

// Парсер тегов использует extractImagePrompts для валидации промптов перед генерацией
export function validatePrompts(markdown: string): string[] {
  return extractImagePrompts(markdown).filter((p) => p.length > 3 && p.length < 300);
}
