"use client";

import { QuickStart } from "@/components/dashboard/QuickStart";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { asArray, useAuthGuard } from "@/hooks/useAuthGuard";
import Link from "next/link";
import { useEffect, useState } from "react";

interface StudentRow { id: number; name: string; completed_topics: string[] }

export default function DashboardPage() {
  const { ready } = useAuthGuard();
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/students").then((r) => (r.ok ? r.json() : [])).then((d) => setStudents(asArray<StudentRow>(d))).catch(() => {});
  }, [ready]);

  if (ready) return <Dashboard students={students} />;
  return <main className="py-16 flex justify-center"><span className="loading loading-dots loading-md" aria-label="Проверка сессии" /></main>;
}

function Dashboard({ students }: { students: StudentRow[] }) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="text-sm text-base-content/60">
          Персональные домашки на основе живого контекста урока.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 content-start lg:col-span-2">
          <QuickStart />
          <StatsRow studentsCount={students.length} />
        </div>
        <aside className="grid gap-6 content-start">
          <RecentStudents students={students} />
        </aside>
      </div>
    </main>
  );
}

function RecentStudents({ students }: { students: StudentRow[] }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">Ученики</h3>
        <Link href="/students" className="text-xs text-primary hover:underline">все →</Link>
      </div>
      <ul className="menu rounded-lg bg-base-100 p-1">
        {students.slice(0, 5).map((s) => (
          <li key={s.id}>
            <Link href="/lesson">
              <span>{s.name}</span>
              <span className="badge badge-ghost badge-sm">{(s.completed_topics ?? []).length}</span>
            </Link>
          </li>
        ))}
        {students.length === 0 && (
          <p className="px-3 py-2 text-sm text-base-content/60">Пока никого нет — добавьте ученика.</p>
        )}
      </ul>
    </div>
  );
}
