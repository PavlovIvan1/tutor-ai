"use client";

import { useEffect, useState } from "react";

/**
 * Клиентский auth-guard: проверяет сессию один раз,
 * неавторизованных редиректит на /login.
 * Пока проверка не пройдена — рендер-заглушка (fetch не выполняются).
 */
export function useAuthGuard(): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setReady(true);
        else window.location.replace("/login");
      })
      .catch(() => window.location.replace("/login"));
  }, []);

  return { ready };
}

/** Безопасный разбор ответа API: только массивы проходят. */
export function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}
