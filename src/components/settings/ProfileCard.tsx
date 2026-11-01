"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function ProfileCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && (setName(d.name), setEmail(d.email)))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Имя</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={email} disabled className="opacity-60" />
          <p className="text-xs text-base-content/60">Email изменить нельзя — он ваш логин.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={save} disabled={saving || !name.trim()}>
            {saving ? "..." : "Сохранить"}
          </Button>
          {saved && <span className="text-sm text-base-content/60">Сохранено</span>}
        </div>
      </CardContent>
    </Card>
  );
}
