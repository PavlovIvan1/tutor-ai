import type { HomeworkSync } from "@/types";

/**
 * Парсер ответа o3-mini: блок JSON-синхронизации до "---",
 * блок Markdown домашки после.
 */
export function parseLlmOutput(raw: string): { sync: HomeworkSync; markdown: string } {
  const dividerIndex = raw.indexOf("\n---");
  const syncPart = dividerIndex >= 0 ? raw.slice(0, dividerIndex) : "";
  const markdown = dividerIndex >= 0 ? raw.slice(dividerIndex + 4).trim() : raw.trim();

  const sync = extractJson<HomeworkSync>(syncPart) ?? { new_errors_found: [], topic_covered: null };

  return {
    sync: {
      new_errors_found: Array.isArray(sync.new_errors_found)
        ? sync.new_errors_found.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
        : [],
      topic_covered: typeof sync.topic_covered === "string" && sync.topic_covered.trim()
        ? sync.topic_covered.trim()
        : null,
    },
    markdown,
  };
}

const firstIndex = (text: string, ch: string) => text.indexOf(ch);
const lastIndex = (text: string, ch: string) => text.lastIndexOf(ch);

function extractJson<T>(text: string): T | null {
  const start = firstIndex(text, "{");
  const end = lastIndex(text, "}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    // LLM мог выдать trailing commas / одинарные кавычки — мягкий фикc
    try {
      const cleaned = text.slice(start, end + 1).replace(/,(\s*[}\]])/g, "$1");
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

/** Вытянуть все [IMAGE_PROMPT: ...] из Markdown. */
export function extractImagePrompts(markdown: string): string[] {
  const regex = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(markdown))) out.push(m[1].trim());
  return out;
}
