"use client";

import Link from "next/link";

/**
 * Блок быстрого старта: нейтральная поверхность (не выделяется),
 * контент слева, справа — только точечный декор, без колец.
 */
export function QuickStart() {
  return (
    <div className="card relative overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <DotsDecor />
      <div className="p-8 text-left">
        <span className="badge badge-ghost mb-3 text-xs">Быстрый старт</span>
        <h2 className="text-xl font-semibold">Домашка за 3 шага</h2>
        <p className="mt-1 max-w-xl text-sm text-base-content/60">
          Запишите звук урока (или загрузите готовый файл) — Tutor сожмёт аудио, расшифрует его,
          обновит контекст ученика и соберёт персонализированное задание в Word.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/lesson" className="btn btn-primary">Начать урок</Link>
          <Link href="/lesson?upload=1" className="btn">Загрузить аудио урока</Link>
        </div>
      </div>
    </div>
  );
}

/** Точки справа от контента (только здесь), затухают к центру. */
function DotsDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 md:block">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(ellipse at right center, black 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
