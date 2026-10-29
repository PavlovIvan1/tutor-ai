"use client";

import { useCallback } from "react";
import { useApiCall } from "@/hooks/useApiCall";
import { useStudentStore } from "@/store/useStudentStore";
import type { HomeworkParams, HomeworkResult } from "@/types";

/**
 * Запрос генерации домашки: параметры + транскрипт -> /api/homework.
 * После ответа накопленный контекст ученика уходит в БД одним батчем.
 */
export function useHomeworkRequest() {
  const generate = async (params: HomeworkParams): Promise<HomeworkResult> => {
    const res = await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Ошибка генерации ДЗ");
    }
    return res.json();
  };

  const { run, loading, error, setError } = useApiCall(generate);

  const requestHomework = useCallback(
    async (params: HomeworkParams): Promise<HomeworkResult | null> => {
      const result = await run(params);
      if (!result) return null;
      // Применяем sync-блок к стейту и батч-апдейтим БД
      const s = useStudentStore.getState();
      s.addPendingErrors(result.sync.new_errors_found ?? []);
      s.appendNotes(result.sync.new_errors_found.join("; "));
      if (result.sync.topic_covered) s.addPendingTopics([result.sync.topic_covered]);
      await s.flushTo({ notes: s.notes, completedTopics: s.completedTopics });
      return result;
    },
    [run]
  );

  return { requestHomework, loading, error, setError };
}
