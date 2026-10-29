"use client";

import { useCallback } from "react";
import { useRecorderStore } from "@/store/useRecorderStore";
import { useDisplayAudioRecorder } from "@/hooks/useDisplayAudioRecorder";
import { useApiCall } from "@/hooks/useApiCall";

/**
 * Полный клиентский медиа-конвейер:
 * отправка сжатого blob -> /api/transcript -> текст.
 * После успешной отправки blob и URL освобождаются немедленно.
 */
export function useTranscription() {
  const { release, collect } = useDisplayAudioRecorder();
  const store = useRecorderStore;

  const transcribe = async (blob: Blob): Promise<string> => {
    const form = new FormData();
    form.append("audio", blob, "lesson.webm");
    const res = await fetch("/api/transcript", { method: "POST", body: form });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Транскрипция не удалась");
    const { text } = (await res.json()) as { text: string };
    return text;
  };

  const { run, loading, error: apiError } = useApiCall(transcribe);

  const sendForTranscription = useCallback(async (): Promise<string | null> => {
    const blob = collect();
    if (!blob) {
      store.getState().setError("Нет записи для отправки");
      return null;
    }
    const text = await run(blob);
    // деструкторы: blob больше не нужен ни клиенту, ни серверу
    release();
    return text;
  }, [collect, release, run, store]);

  return { sendForTranscription, loading, error: apiError };
}
