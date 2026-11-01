"use client";

import { Checkbox, Input, Label } from "@/components/ui/controls";
import { YandexButton } from "@/components/layout/YandexButton";
import { Consents } from "@/components/layout/Consents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useEmailAuth } from "@/components/layout/useEmailAuth";interface RegisterProps { onSwitch: () => void }

/** Регистрация: имя, email, пароль, согласия + опциональная рассылка. */
export function RegisterForm({ onSwitch }: RegisterProps) {
  const { email, password, setEmail, setPassword, error, loading, submit } = useEmailAuth();
  const [terms, setTerms] = useState(false);
  const [mailing, setMailing] = useState(false);
  const blocked = !terms;

  return (
    <Card className="rounded-xl">
      <CardHeader><CardTitle>Регистрация</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        <YandexButton onClick={() => (window.location.href = "/api/auth/yandex")} label="Зарегистрироваться с Яндекс ID" />
        <div className="flex items-center gap-3 text-xs text-base-content/40">
          <span className="h-px flex-1 bg-base-300" /> или по почте <span className="h-px flex-1 bg-base-300" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@mail.ru" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Пароль (минимум 6 символов)</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit("/api/auth/register", { email, password, mailing })} />
        </div>
        <Consents required={[terms, setTerms]} mailing={[mailing, setMailing]} />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button onClick={() => !blocked && submit("/api/auth/register", { email, password, mailing })} disabled={blocked || loading}>
          {loading ? <span className="loading loading-dots loading-xs" /> : blocked ? "Примите согласия" : "Создать аккаунт"}
        </Button>
        <button className="text-sm text-base-content/60 transition-colors hover:text-base-content" onClick={onSwitch}>
          Уже есть аккаунт? Войти
        </button>
      </CardContent>
    </Card>
  );
}
