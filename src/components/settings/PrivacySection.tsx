"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RULES = [
  "Аудио сжимается прямо в браузере и никуда не копируется на диск",
  "Транскрипты и контекст учеников доступны только вашей учетной записи",
  "Любой урок или ученика можно удалить в один клик",
];

export function PrivacySection() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Конфиденциальность</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <p className="text-base-content/60">Записи уроков хранятся безопасно и доступны только вам.</p>
        <ul className="list-disc space-y-1 pl-5 text-base-content/60">
          {RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <div className="flex items-center justify-between rounded-lg border border-base-300 px-4 py-3">
          <div>
            <p className="font-medium">Выйти из аккаунта</p>
            <p className="text-xs text-base-content/60">Завершить сессию на этом устройстве.</p>
          </div>
          <Button size="sm" variant="destructive" onClick={logout}>Выйти</Button>
        </div>
      </CardContent>
    </Card>
  );
}
