"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDisplayAudioRecorder } from "@/hooks/useDisplayAudioRecorder";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecorderStore } from "@/store/useRecorderStore";
import { useMemo } from "react";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function RecordPanel({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { start, stop, status } = useDisplayAudioRecorder();
  const { sendForTranscription, loading, error } = useTranscription();
  const recording = useRecorderStore((s) => s.status === "recording");
  const ready = useRecorderStore((s) => s.status === "ready");
  const durationSec = useRecorderStore((s) => s.durationSec);
  const size = useRecorderStore((s) => s.blobSize);
  const storeError = useRecorderStore((s) => s.error);

  const sizeLabel = useMemo(() => (size ? `${(size / 1024).toFixed(0)} KB` : ""), [size]);

  const handleClick = async () => {
    if (status === "idle") { await start(); return; }
    if (status === "recording") { stop(); return; }
    if (status === "ready") {
      const text = await sendForTranscription();
      if (text) onTranscript(text);
    }
  };

  const label = recording ? "Остановить" : ready ? "Транскрибировать" : "Начать запись";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Запись урока</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-3">
          <Button onClick={handleClick} disabled={loading || status === "releasing"}>
            {loading ? <span className="loading loading-dots loading-xs" /> : label}
          </Button>
          {loading && <span className="loading loading-spinner loading-sm" />}
          {recording && <span className="badge badge-error badge-outline font-mono gap-1.5 py-3">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-error" /></span>
            {fmt(durationSec)}
          </span>}
          {ready && <span className="badge badge-success badge-outline">{sizeLabel}</span>}
        </div>
        {(error || storeError) && (
          <div className="alert alert-error py-2 text-sm">
            <span>{error ?? storeError}</span>
          </div>
        )}
        <p className="text-xs text-base-content/60">
          Захват системного звука (голос ученика) через шаринг экрана. Сжатие Opus 24 kbps идёт в браузере: за 10 минут урока сервер получает лишь ~1.8 МБ.
        </p>
      </CardContent>
    </Card>
  );
}
