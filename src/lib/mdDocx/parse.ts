// Строчный Markdown-парсер для DOCX: заголовки, списки, bold, параграфы.

export type MdBlock =
  | { kind: "h1" | "h2" | "h3"; text: string }
  | { kind: "bullet"; parts: Inline[] }
  | { kind: "para"; parts: Inline[] };

export type Inline = { text: string; bold: boolean };

export function parseMarkdown(md: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3) });
    } else if (line.startsWith("# ")) {
      blocks.push({ kind: "h1", text: line.slice(2) });
    } else if (/^([-*]|\d+\.)\s+/.test(line)) {
      const text = line.replace(/^([-*]|\d+\.)\s+/, "");
      blocks.push({ kind: "bullet", parts: parseInline(text) });
    } else {
      blocks.push({ kind: "para", parts: parseInline(line) });
    }
  }
  return blocks;
}

/** **bold** и __bold__ -> Inline[]. */
function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  const regex = /\*\*(.+?)\*\*|__(.+?)__/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1] ?? m[2] ?? "", bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}

/** Разделить блок Part 3: строка [IMAGE_PROMPT: ...] — маркер вставки изображения. */
export function splitByImagePrompts(md: string): Array<{ image?: string; text: string }> {
  const out: Array<{ image?: string; text: string }> = [];
  for (const chunk of md.split(/\[IMAGE_PROMPT:\s*/)) {
    if (!chunk) continue;
    const close = chunk.indexOf("]");
    if (close < 0) {
      out.push({ text: chunk });
      continue;
    }
    const prompt = chunk.slice(0, close).trim();
    if (out.length) out.push({ image: prompt, text: "" });
    else out.push({ image: prompt, text: "" }, { text: "" });
    const rest = chunk.slice(close + 1).replace(/^\s+/, "");
    if (rest) out.push({ text: rest });
  }
  return out;
}
