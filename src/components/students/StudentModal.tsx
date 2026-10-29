"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/controls";
import { useState } from "react";

const LEVELS = [
  { value: "", label: "Не знаю / новичок" },
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper-Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficiency" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (data: { name: string; surname: string; level: string }) => Promise<void>;
}

/** Модалка создания ученика: имя, фамилия и примерный уровень (для ИИ). */
export function StudentModal({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate({ name, surname, level });
    setSaving(false);
    setName(""); setSurname(""); setLevel("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый ученик</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ирина" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surname">Фамилия</Label>
              <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Петрова" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">Примерный уровень (влияет на сложность домашки)</Label>
            <Select id="level" options={LEVELS} value={level} onChange={(e) => setLevel(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={saving || !name.trim()}>
            {saving ? <span className="loading loading-dots loading-xs" /> : "Добавить ученика"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
