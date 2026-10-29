"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeworkResult } from "@/types";
import { useMemo } from "react";

/** Рендер Markdown домашки без внешних парсеров: заголовки, списки, текст. */
export function HomeworkView({ result }: { result: HomeworkResult | null }) {
  const sections = useMemo(() => splitSections(result?.markdown ?? ""), [result]);
  if (!result) return null;

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Домашнее задание</CardTitle>
        <a
          href={`/api/homework/docx/${result.lessonId}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Скачать .docx
        </a>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {sections.map((s, i) => renderSection(s, i))}
      </CardContent>
    </Card>
  );
}

function splitSections(md: string): string[][] {
  return md.split(/^###\s+/m).filter(Boolean).map((sec) => sec.trim().split(/\r?\n/));
}

function renderSection(lines: string[], key: number) {
  const title = lines[0];
  const body = lines.slice(1);
  return (
    <section key={key}>
      <div className="divider my-2 first:hidden text-sm font-semibold">{title.startsWith("HOMEWORK") ? "" : title.replace(/^##\s*/, "")}</div>
      <ul className="list-disc space-y-1 pl-5">
        {body.filter(Boolean).map((l, i) => (
          <li key={i} className="text-base-content/90">{l.replace(/^\s*([-*]|\d+\.)\s*/, "")}</li>
        ))}
      </ul>
    </section>
  );
}
