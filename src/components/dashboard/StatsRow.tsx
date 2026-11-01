"use client";

import { useEffect, useState } from "react";

interface LessonRow { id: number; createdAt: string; hasHomework: boolean }

const fmtDate = (iso: string) =>
  new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

/** Блок статистики: daisyUI `stats stats-vertical`. */
export function StatsRow({ studentsCount }: { studentsCount: number }) {
  const [lessons, setLessons] = useState<LessonRow[]>([]);

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLessons(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const withHomework = lessons.filter((l) => l.hasHomework).length;
  const lastDate = lessons[0] ? fmtDate(lessons[0].createdAt) : "—";

  return (
    <div className="stats stats-vertical bg-base-100 border border-base-300 shadow-sm rounded-xl">
      <Stat title="Ученики" value={String(studentsCount)} />
      <Stat title="Уроки" value={String(lessons.length)} />
      <Stat title="Домашки готовы" value={String(withHomework)} />
      <Stat title="Последний урок" value={lastDate} />
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
