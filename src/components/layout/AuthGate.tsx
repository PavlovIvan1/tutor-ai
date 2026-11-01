"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { ReactNode } from "react";

/**
 * Серверная обёртка auth-guard: пока сессия не проверена — заглушка,
 * гостя отправляет на /login. Дети получают данные только после gate.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { ready } = useAuthGuard();
  if (!ready) {
    return <p className="py-8 text-sm text-base-content/60">Загрузка...</p>;
  }
  return <>{children}</>;
}
