"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { asArray } from "@/hooks/useAuthGuard";
import { useApiCall } from "@/hooks/useApiCall";
import { StudentModal } from "@/components/students/StudentModal";
import Link from "next/link";
import { useEffect, useState } from "react";

interface StudentRow { id: number; name: string; notes: string; completed_topics: string[]; level: string }

async function fetchStudents(): Promise<StudentRow[]> {
  const res = await fetch("/api/students");
  if (!res.ok) throw new Error("Не удалось загрузить учеников");
  const data: unknown = await res.json();
  return asArray<StudentRow>(data);
}

export function StudentList() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { run, loading, error } = useApiCall(fetchStudents);

  const load = async () => setStudents((await run()) ?? []);
  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const createStudent = async (d: { name: string; surname: string; level: string }) => {
    await fetch("/api/students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    load();
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModalOpen(true)}>+ Добавить ученика</Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {students.map((s) => (
          <Link key={s.id} href={`/lesson?studentId=${s.id}`} className="block">
            <Card interactive className="rounded-xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <span className="font-medium">{s.name}</span>
                  {s.level && <span className="badge badge-ghost badge-sm ml-2">{s.level}</span>}
                </div>
                <span className="text-xs text-base-content/60">тем пройдено: {(s.completed_topics ?? []).length}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {students.length === 0 && <p className="text-sm text-base-content/60">Учеников пока нет.</p>}
      <StudentModal open={modalOpen} onOpenChange={setModalOpen} onCreate={createStudent} />
    </div>
  );
}
