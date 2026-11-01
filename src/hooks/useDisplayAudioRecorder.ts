"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRecorderStore } from "@/store/useRecorderStore";

const BITRATE = 24_000; // 24 kbps Opus mono — сжатие прямо в браузере

function pickMime(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) ?? "audio/webm";
}

/**
 * Захват системного звука через getDisplayMedia.
 * Из стрима берётся ТОЛЬКО audio-дорожка (голос ученика),
 * видео-дорожка немедленно глушится. Сжатие — нативным
 * MediaRecorder (Opus): сервер не видит сырого PCM.
 */
export function useDisplayAudioRecorder() {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const store = useRecorderStore;

  /** Очистка всех ресурсов: треки, рекордер, blob, URL. */
  const release = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current); // моментальная очистка памяти
      urlRef.current = null;
    }
    fileRef.current = null;
    store.getState().releaseBlob(); // Blob зануляем в стейте
    store.getState().setStatus("idle");
  }, [store]);

  /** Старт: просим экран/вкладку с системным звуком. */
  const start = useCallback(async (): Promise<boolean> => {
    store.getState().setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // видео нужно, чтобы браузер дал галочку системного звука
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      stream.getVideoTracks().forEach((t) => t.stop());
      if (stream.getAudioTracks().length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        store.getState().setError("Системный аудио-трек не захвачен. Включите 'Capture system audio'.");
        return false;
      }
      const audioOnly = new MediaStream(stream.getAudioTracks());
      streamRef.current = stream;
      const mime = pickMime();
      const recorder = new MediaRecorder(audioOnly, {
        mimeType: mime,
        audioBitsPerSecond: BITRATE,
      });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = []; // буферы чанков чистим сразу
        fileRef.current = blob;
        urlRef.current = URL.createObjectURL(blob);
        store.getState().setBlob(urlRef.current, blob.size);
        store.getState().setStatus("ready");
      };
      if (stream.getAudioTracks()[0]) {
        stream.getAudioTracks()[0].onended = () => release(); // юзер отключил шаринг
      }
      recorder.start(4000); // чанки по 4 сек — RAM не растёт
      store.getState().setStatus("recording");
      store.getState().setDuration(0);
      timerRef.current = setInterval(() => {
        const { durationSec, setDuration } = store.getState();
        setDuration(durationSec + 1);
      }, 1000);
      return true;
    } catch (e) {
      store.getState().setError(e instanceof Error ? e.message : "Доступ к экрану отклонён");
      release();
      return false;
    }
  }, [release, store]);

  /** Стоп записи -> готовый сжатый blob. */
  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  /** Получить сжатый файл и сразу освободить ресурсы записи. */
  const collect = useCallback((): Blob | null => {
    const blob = fileRef.current;
    return blob;
  }, [release]);

  useEffect(() => release, [release]); // unmount cleanup (деструктор)

  return { start, stop, release, collect, status };
}
