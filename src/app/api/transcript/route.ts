import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSettingModels, transcribeAudio } from "@/lib/openrouter";

// 1 CPU / 1 GB RAM: принимаем только сжатый Opus (~3 MB / 15 минут),
// буфер живёт лишь в пределах запроса, в файл на диске НЕ пишем.
const MAX_BYTES = 12 * 1024 * 1024;

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Нет аудиофайла" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Аудио слишком велико (>12 MB)" }, { status: 413 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const text = await transcribeAudio(buf.toString("base64"), file.type || "audio/webm", getSettingModels().transcribe);
    buf.fill(0); // моментальная очистка буфера после использования
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка транскрипции" },
      { status: 502 }
    );
  }
}
