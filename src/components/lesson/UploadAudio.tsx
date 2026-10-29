"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiCall } from "@/hooks/useApiCall";
import { useRef, useState } from "react";

async function upload(file: File): Promise<string> {
  const form = new FormData();
  form.append("audio", file, file.name);
  const res = await fetch("/api/transcript", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Транскрипция не удалась");
  }
  const { text } = (await res.json()) as { text: string };
  return text;
}

/** Загрузка заранее записанного аудио урока. */
export function UploadAudio({ onTranscript }: { onTranscript: (t: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const { run, loading, error } = useApiCall(upload);

  const pick = async (f: File) => {
    setFileName(f.name);
    const text = await run(f);
    if (text) onTranscript(text);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader><CardTitle>Готовое аудио</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <input
          ref={inputRef} type="file" accept="audio/*,video/webm" className="hidden"
          onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
        />
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={loading}>
          {loading ? "Транскрипция..." : "Выбрать файл"}
        </Button>
        {fileName && !loading && <p className="truncate text-xs text-base-content/60">{fileName}</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        <p className="text-xs text-base-content/60">MP3 / M4A / OGG / WEBM. Файл не хранится на сервере.</p>
      </CardContent>
    </Card>
  );
}
