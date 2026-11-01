import { create } from "zustand";
import type { RecorderStatus } from "@/types";

/**
 * Zustand-стор рекордера. Blob хранится ПОКА он не нужен,
 * после отправки транскрипции - зануляется (prevent memory leak).
 */
interface RecorderState {
  status: RecorderStatus;
  durationSec: number;
  blobUrl: string | null;
  blobSize: number;
  error: string | null;
  setStatus: (s: RecorderStatus) => void;
  setDuration: (sec: number) => void;
  setBlob: (blobUrl: string, size: number) => void;
  releaseBlob: () => void;
  setError: (msg: string | null) => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  status: "idle",
  durationSec: 0,
  blobUrl: null,
  blobSize: 0,
  error: null,
  setStatus: (status) => set({ status }),
  setDuration: (durationSec) => set({ durationSec }),
  setBlob: (blobUrl, blobSize) => set({ blobUrl, blobSize }),
  releaseBlob: () => set({ blobUrl: null, blobSize: 0 }),
  setError: (error) => set({ error }),
}));
