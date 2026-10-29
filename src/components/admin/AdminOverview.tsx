"use client";

import { useEffect, useState } from "react";

interface Stats {
  counts: { users: number; students: number; lessons: number; homework: number };
  growth: Array<{ week: string; users: number; lessons: number }>;
  averages: { studentsPerTeacher: number; lessonsPerWeek: number; lessonMinutes: number };
}

/** Обзор: daisyUI `stats` + график роста (CSS-бары) + средние. */
export function AdminOverview() {
  const [data, setData] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  }, []);
  if (!data) return <span className="loading loading-dots loading-md block py-10" />;

  return (
    <div className="grid gap-6">
      <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border border-base-300 shadow-sm rounded-xl w-full">
        <Stat title="Пользователи" value={String(data.counts.users)} />
        <Stat title="Ученики" value={String(data.counts.students)} />
        <Stat title="Уроки" value={String(data.counts.lessons)} />
        <Stat title="Домашки" value={String(data.counts.homework)} />
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h3 className="mb-4 font-medium">Рост за 8 недель (уроки / новые юзеры)</h3>
        <GrowthChart growth={data.growth} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AvgCard title="Учеников на препода" value={String(data.averages.studentsPerTeacher)} />
        <AvgCard title="Уроков в неделю (активные 4 нед.)" value={String(data.averages.lessonsPerWeek)} />
        <AvgCard title="Длительность урока (оценка)" value={`~${data.averages.lessonMinutes} мин`} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat py-3">
      <div className="stat-title text-xs">{title}</div>
      <div className="stat-value text-2xl">{value}</div>
    </div>
  );
}

function AvgCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <p className="text-xs text-base-content/60">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function GrowthChart({ growth }: { growth: Stats["growth"] }) {
  const max = Math.max(1, ...growth.map((g) => Math.max(g.lessons, g.users)));
  if (!growth.length) return <p className="text-sm text-base-content/60">Нет данных за неделю.</p>;
  return (
    <div className="flex items-end gap-3 h-40">
      {growth.map((g) => (
        <div key={g.week} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-full w-full items-end gap-1">
            <Bar title={`${g.week}: уроки ${g.lessons}`} heightPct={(g.lessons / max) * 100} cls="bg-primary" />
            <Bar title={`${g.week}: юзеры ${g.users}`} heightPct={(g.users / max) * 100} cls="bg-secondary" />
          </div>
          <span className="text-[10px] text-base-content/50">{g.week.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function Bar({ title, heightPct, cls }: { title: string; heightPct: number; cls: string }) {
  return (
    <div title={title} className={`w-full rounded-t ${cls}`} style={{ height: `${Math.max(heightPct, 2)}%` }} />
  );
}
