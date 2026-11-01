"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/controls";
import { useState } from "react";

/** Логин в админку (креды выдает владелец сервиса: env ADMIN_LOGIN/ADMIN_PASSWORD). */
export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Логин оф");
      onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-sm py-16">
      <Card className="rounded-xl">
        <CardHeader><CardTitle>Админ-панель Tutor</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admLogin">Логин</Label>
            <Input id="admLogin" value={login} onChange={(e) => setLogin(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admPass">Пароль</Label>
            <Input id="admPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button onClick={submit} disabled={loading}>
            {loading ? <span className="loading loading-dots loading-xs" /> : "Войти"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
