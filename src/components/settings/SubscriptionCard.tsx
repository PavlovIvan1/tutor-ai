"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const PLANS = [
  { name: "Старт", price: "0 ₽", features: ["3 ученика", "120 мин транскрипции/мес", "Базовые модели ИИ"] },
  { name: "Про", price: "990 ₽/мес", features: ["Неограниченно учеников", "600 мин транскрипции/мес", "o3-mini + смотреть модели"] },
  { name: "Безлимит", price: "1990 ₽/мес", features: ["Всё из Про", "Неограниченные минуты", "Приоритетная поддержка"] },
];

export function SubscriptionCard() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Подписка</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-3">
          <div>
            <p className="font-medium">Нет активной подписки</p>
            <p className="text-xs text-base-content/60">Доступен пробный режим</p>
          </div>
          <span className="badge badge-outline badge-sm">Free</span>
        </div>
        <Button size="sm" className="w-fit" onClick={() => setOpen(true)}>Выбрать тариф</Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Тарифы Tutor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className="card card-border rounded-xl border-base-300 transition-shadow hover:shadow-md">
                <div className="card-body p-4">
                  <p className="card-title text-base font-semibold">{p.name}</p>
                  <p className="text-lg">{p.price}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-base-content/60">
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <Button size="sm" variant="outline" className="mt-3 w-full" disabled>Скоро</Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-base-content/60">Оплата подключается позже — сейчас все функции открыты.</p>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
