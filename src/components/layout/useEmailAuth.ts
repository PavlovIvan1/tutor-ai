"use client";

import { useState } from "react";

/** Email/пароль как единый источник стейта для форм входа. */
export function useEmailAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Ошибка");
      window.location.href = "/";
      await new Promise(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return { email, password, setEmail, setPassword, error, loading, submit };
}
