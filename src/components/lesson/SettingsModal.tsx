"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export interface Settings {
  reviewCount: number;
  newTopicCount: number;
  newTopicName: string;
  imageTasksCount: 0 | 1 | 2;
  writingRequired: boolean;
  examFormat: "NONE" | "OGE" | "EGE" | "TOEFL" | "IELTS";
}

const DEFAULTS: Settings = {
  reviewCount: 5, newTopicCount: 3, newTopicName: "",
  imageTasksCount: 1, writingRequired: false, examFormat: "NONE",
};

const EXAMS = [
  { value: "NONE", label: "Нет" }, { value: "OGE", label: "ОГЭ" },
  { value: "EGE", label: "ЕГЭ" }, { value: "TOEFL", label: "TOEFL" },
  { value: "IELTS", label: "IELTS" },
];

export function SettingsModal({
  open, onOpenChange, onConfirm, loading,
}: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (s: Settings) => void; loading: boolean }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Параметры домашки</DialogTitle>
          <DialogDescription>Настройте структуру заданий перед генерацией.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Counter label="Заданий на повторение" value={s.reviewCount} max={10}
            onChange={(v) => set("reviewCount", v)} />
          <Counter label="Заданий на новую тему" value={s.newTopicCount} max={10}
            onChange={(v) => set("newTopicCount", v)} />
          <div className="grid gap-2">
            <Label htmlFor="topic">Название новой темы</Label>
            <Input id="topic" value={s.newTopicName} placeholder="Напр. Present Perfect"
              onChange={(e) => set("newTopicName", e.target.value)} />
          </div>
          <Counter label="Заданий с картинками" value={s.imageTasksCount} max={2}
            onChange={(v) => set("imageTasksCount", v as 0 | 1 | 2)} />
          <div className="flex items-center gap-2">
            <Checkbox id="writing" checked={s.writingRequired}
              onCheckedChange={(v) => set("writingRequired", Boolean(v))} />
            <Label htmlFor="writing">Задание с письмом</Label>
          </div>
          <div className="grid gap-2">
            <Label>Формат экзамена</Label>
            <Select options={EXAMS} value={s.examFormat} onChange={(e) => set("examFormat", e.target.value as Settings["examFormat"])} />
          </div>
          <Button onClick={() => onConfirm(s)} disabled={loading}>
            {loading ? <span className="loading loading-dots loading-xs" /> : "Сгенерировать"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Counter({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-base-content/60">{value}</span>
      </div>
      <Slider min={0} max={max} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
