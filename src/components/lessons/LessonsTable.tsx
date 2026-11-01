"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LessonRow {
  id: number;
  studentName: string;
  createdAt: string;
  hasHomework: boolean;
  hasTranscript: boolean;
}

const fmt = (iso: string) =>
  new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

function status(l: LessonRow) {
  if (!l.hasTranscript) return { label: "Нет транскрипта", cls: "badge-ghost" };
  if (l.hasHomework) return { label: "Домашка готова", cls: "badge-neutral" };
  return { label: "Нет домашки", cls: "badge-ghost" };
}

/** Лента уроков: daisyUI `avatar` + `badge`. */
export function LessonsTable() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLessons(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <span className="loading loading-dots loading-md" />;
  if (lessons.length === 0) {
    return <p className="text-sm text-base-content/70">Уроков пока нет — начните первый с дашборда.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      {lessons.map((l) => {
        const s = status(l);
        return (
          <Link key={l.id} href={`/lessons/${l.id}`}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-base-200/60">
            <div className="flex items-center gap-4">
              <span className="avatar placeholder">
                <span className="w-10 rounded-lg bg-base-300 text-sm font-semibold place-items-center grid">
                  {l.studentName.slice(0, 2).toUpperCase()}
                </span>
              </span>
              <div>
                <p className="font-medium">{l.studentName}</p>
                <p className="text-xs text-base-content/60">{fmt(l.createdAt)}</p>
              </div>
            </div>
            <span className={`badge badge-sm border-base-300 ${s.cls}`}>{s.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
