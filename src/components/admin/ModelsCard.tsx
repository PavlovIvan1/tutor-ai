"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEffect, useState } from "react";

const HOMEWORK = [
  { value: "", label: "По умолчанию (env)" },
  { value: "openai/o3-mini", label: "o3-mini — основная" },
  { value: "openai/o3-mini-high", label: "o3-mini-high — качественнее" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash 1.5 — дешевая" },
];

const TRANSCRIBE = [
  { value: "", label: "По умолчанию (env)" },
  { value: "openai/whisper-large-v3-turbo", label: "Whisper large-v3 turbo" },
  { value: "openai/whisper-large-v3", label: "Whisper large-v3" },
];

export function ModelsCard() {
  const [data, setData] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/models").then((r) => (r.ok ? r.json() : {})).then(setData).catch(() => {});
  }, []);

  const save = async () => {
    await fetch("/api/admin/models", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Модели ИИ по умолчанию (для всех юзеров)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label>Генерация домашки</Label>
          <Select value={data.homeworkModel ?? ""} options={HOMEWORK}
            onChange={(e) => setData((p) => ({ ...p, homeworkModel: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Транскрипция</Label>
          <Select value={data.transcribeModel ?? ""} options={TRANSCRIBE}
            onChange={(e) => setData((p) => ({ ...p, transcribeModel: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Своя модель (provider/model-id)</Label>
          <Input value={data.customModel ?? ""}
            placeholder="meta-llama/llama-3-70b-instruct"
            onChange={(e) => setData((p) => ({ ...p, customModel: e.target.value }))} />
          <p className="text-xs text-base-content/60">
            Личный выбор юзера приоритетнее. Ключ OpenRouter задается переменными окружения на сервере.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={save}>Сохранить</Button>
          {saved && <span className="text-sm text-base-content/60">Сохранено</span>}
        </div>
      </CardContent>
    </Card>
  );
}
