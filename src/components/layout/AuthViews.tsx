"use client";

import { YandexButton } from "@/components/layout/YandexButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox, Input, Label } from "@/components/ui/controls";
import { useState } from "react";

import { useEmailAuth } from "@/components/layout/useEmailAuth";

interface ViewProps { onSwitch: () => void }

/** Вход: email+пароль или Яндекс ID. */
export function LoginForm({ onSwitch }: ViewProps) {
  const { email, password, setEmail, setPassword, error, loading, submit } = useEmailAuth();
  return (
    <Card className="rounded-xl">
      <CardHeader><CardTitle>Вход в Tutor</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <YandexButton onClick={() => (window.location.href = "/api/auth/yandex")} />
        <div className="flex items-center gap-2 text-xs text-base-content/40">
          <span className="h-px flex-1 bg-base-300" /> или по email <span className="h-px flex-1 bg-base-300" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@mail.ru" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit("/api/auth/login", { email, password })} />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <Button onClick={() => submit("/api/auth/login", { email, password })} disabled={loading}>
          {loading ? <span className="loading loading-dots loading-xs" /> : "Войти"}
        </Button>
        <button className="text-sm text-base-content/60 transition-colors hover:text-base-content" onClick={onSwitch}>
          Нет аккаунта? Зарегистрироваться
        </button>
      </CardContent>
    </Card>
  );
}
