"use client";

import { HomeworkView } from "@/components/lesson/HomeworkView";
import { RecordPanel } from "@/components/lesson/RecordPanel";
import { UploadAudio } from "@/components/lesson/UploadAudio";
import { SettingsModal } from "@/components/lesson/SettingsModal";
import { Button } from "@/components/ui/button";
import type { HomeworkResult } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Lesson {
  id: number; studentId: number; studentName: string; createdAt: string;
  transcript: string; homeworkMd: string; completedTopics: string[];
}

export function LessonDetail({ lessonId }: { lessonId: number }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<HomeworkResult | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((l: Lesson) => {
        setLesson(l);
        setTranscript(l.transcript);
        if (l.homeworkMd) setResult({ lessonId: l.id, markdown: l.homeworkMd, sync: { new_errors_found: [], topic_covered: null } });
      })
      .catch(() => {});
  }, [lessonId]);

  if (!lesson) return (
    <main className="p-8"><span className="loading loading-dots loading-md" aria-label="Загрузка" /></main>
  );

  const canGenerate = Boolean(transcript);

  const generate = async (s: SettingsLike) => {
    setOpen(false);
    const res = await fetch("/api/homework", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id, studentId: lesson.studentId, transcript,
        reviewCount: s.reviewCount, newTopicCount: s.newTopicCount, newTopicName: s.newTopicName,
        imageTasksCount: s.imageTasksCount, writingRequired: s.writingRequired, examFormat: s.examFormat,
      }),
    });
    if (res.ok) setResult(await res.json());
  };

  return (
    <main className="mx-auto max-w-3xl grid gap-5 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{lesson.studentName}</h1>
          <p className="text-sm text-base-content/60">Урок от {new Date(lesson.createdAt.replace(" ", "T") + "Z").toLocaleString("ru-RU")}</p>
        </div>
        <Link href="/lessons" className="btn btn-ghost btn-sm">← К урокам</Link>
      </div>

      {transcript && (
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="badge badge-success badge-sm">OK</span>
            <p className="font-medium">Транскрипт получен ({transcript.length} симв.)</p>
          </div>
        </div>
      )}

      {!transcript && (
        <div className="grid gap-4 sm:grid-cols-2">
          <RecordPanel onTranscript={setTranscript} />
          <UploadAudio onTranscript={setTranscript} />
        </div>
      )}

      <HomeworkView result={result} />
      <Button onClick={() => setOpen(true)} disabled={!canGenerate}>
        {result ? "Перегенерировать домашку" : "Сгенерировать домашку"}
      </Button>
      <SettingsModal open={open} onOpenChange={setOpen} onConfirm={generate} loading={false} />
    </main>
  );
}

interface SettingsLike {
  reviewCount: number; newTopicCount: number; newTopicName: string;
  imageTasksCount: 0 | 1 | 2; writingRequired: boolean;
  examFormat: "NONE" | "OGE" | "EGE" | "TOEFL" | "IELTS";
}
