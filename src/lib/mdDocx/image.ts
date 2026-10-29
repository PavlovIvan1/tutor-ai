import crypto from "crypto";
import { extractImagePrompts } from "@/lib/parse";

const CACHE_LIMIT = 20;

/**
 * Быстрый сторонний генератор картинок (pollinations.ai — GET без ключа).
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

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=384&nologo=true&seed=${seedFrom(prompt)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const data = Buffer.from(await res.arrayBuffer());

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
