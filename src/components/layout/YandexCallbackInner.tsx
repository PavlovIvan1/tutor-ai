"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Шлет code+state в API после редиректа от Яндекса, затем на дашборд. */
export function Inner() {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state") ?? "";
    if (!code) { setError("Не хватает параметров авторизации"); return; }
    fetch("/api/auth/yandex/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Ошибка входа");
        window.location.replace("/");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка входа"));
  }, [params]);

  if (error) return <p className="text-sm text-error">{error}</p>;
  return <span className="loading loading-dots loading-lg" aria-label="Вход через Яндекс" />;
}
