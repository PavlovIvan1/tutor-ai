"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StudentRow { id: number; name: string }

/** Страница "Начать урок": выбор ученика -> создание урока -> редирект на деталь. */
export function StartLesson() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const uploadHint = useIsUploadHint();

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => {});
  }, []);

  const start = async () => {
    if (!studentId) return;
    setLoading(true);
    const res = await fetch("/api/lessons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: Number(studentId) }),
    });
    const { id } = await res.json();
    router.push(uploadHint ? `/lessons/${id}?upload=1` : `/lessons/${id}`);
  };

  return (
    <Card className="mx-auto max-w-md rounded-xl">
      <CardHeader>
        <CardTitle>{uploadHint ? "Загрузить аудио урока" : "Начать урок"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={[
            { value: "", label: "Выберите ученика..." },
            ...students.map((s) => ({ value: String(s.id), label: s.name })),
          ]}
        />
        <Button onClick={start} disabled={!studentId || loading}>
          {loading ? "Создаем урок..." : uploadHint ? "Создать урок и загрузить аудио" : "Создать урок"}
        </Button>
        {students.length === 0 && (
          <p className="text-sm text-base-content/60">
            Сначала <a href="/students" className="underline transition-colors hover:text-base-content">добавьте ученика</a>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Признак "загрузить готовое аудио" (?upload=1) читается только на клиенте. */
function useIsUploadHint(): boolean {
  const [hint, setHint] = useState(false);
  useEffect(() => setHint(window.location.search.includes("upload=1")), []);
  return hint;
}
