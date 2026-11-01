import type { HomeworkSync } from "@/types";

const CEFR_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const CONFIDENCE = new Set(["high", "medium", "low"]);

/**
 * Парсер ответа модели: блок JSON-синхронизации до "---",
 * блок Markdown домашки после.
 */
export function parseLlmOutput(raw: string): { sync: HomeworkSync; markdown: string } {
  const dividerIndex = raw.indexOf("\n---");
  const syncPart = dividerIndex >= 0 ? raw.slice(0, dividerIndex) : "";
  const markdown = dividerIndex >= 0 ? raw.slice(dividerIndex + 4).trim() : raw.trim();

  return { sync: normalizeSync(extractJson<Partial<HomeworkSync>>(syncPart)), markdown };
}

/** Мягкая нормализация sync-блока: только валидные значения CEFR/уверенности, строки без пустых. */
function normalizeSync(raw: Partial<HomeworkSync> | null): HomeworkSync {
  const rawLevel = typeof raw?.level === "string" ? raw.level.trim().toUpperCase() : "";
  const rawConf = typeof raw?.level_confidence === "string" ? raw.level_confidence.trim().toLowerCase() : "";
  return {
    level: CEFR_LEVELS.has(rawLevel) ? rawLevel : null,
    level_confidence: (CONFIDENCE.has(rawConf) ? rawConf : null) as HomeworkSync["level_confidence"],
    strong_areas: strList(raw?.strong_areas),
    weak_areas: strList(raw?.weak_areas),
    learning_priorities: strList(raw?.learning_priorities),
    new_errors_found: strList(raw?.new_errors_found),
    topic_covered:
      typeof raw?.topic_covered === "string" && raw.topic_covered.trim() ? raw.topic_covered.trim() : null,
  };
}

function strList(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
    : [];
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
