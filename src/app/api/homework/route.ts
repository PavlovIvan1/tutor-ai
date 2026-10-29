import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { callO3Mini, getSettingModels } from "@/lib/openrouter";
import { parseLlmOutput } from "@/lib/parse";
import { buildSystemPrompt } from "@/lib/prompt";
import type { HomeworkParams } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const EXAMS = new Set(["NONE", "OGE", "EGE", "TOEFL", "IELTS"]);

function validate(body: Partial<HomeworkParams>): HomeworkParams | null {
  if (!body.studentId || !body.transcript) return null;
  return {
    studentId: Number(body.studentId),
    transcript: String(body.transcript).slice(0, 40_000),
    reviewCount: clamp(body.reviewCount, 0, 10),
    newTopicCount: clamp(body.newTopicCount, 0, 10),
    newTopicName: String(body.newTopicName ?? "").slice(0, 200),
    imageTasksCount: clamp(body.imageTasksCount, 0, 2) as 0 | 1 | 2,
    writingRequired: Boolean(body.writingRequired),
    examFormat: EXAMS.has(String(body.examFormat)) ? (body.examFormat as HomeworkParams["examFormat"]) : "NONE",
  };
}

const clamp = (v: unknown, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(Number(v)) ? Number(v) : 0));

export async function POST(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Неавторизован" }, { status: 401 });

  const params = validate(await req.json().catch(() => ({})));
  if (!params) return NextResponse.json({ error: "Некорректные параметры" }, { status: 400 });

  const db = getDb();
  const student = db
    .prepare("SELECT * FROM students WHERE id = ? AND user_id = ?")
    .get(params.studentId, user.id) as { id: number; notes: string; completed_topics: string } | undefined;
  if (!student) return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });

  const system = buildSystemPrompt(
    params,
    parseTopics(student.completed_topics),
    student.notes,
    (student as { level?: string }).level ?? ""
  );
  const { sync, markdown } = parseLlmOutput(await callO3Mini(system, getSettingModels().homework));

  const lessonId = saveLesson(db, params, markdown);
  return NextResponse.json({ lessonId, markdown, sync });
}

function parseTopics(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveLesson(db: ReturnType<typeof getDb>, params: HomeworkParams, md: string): number {
  const lessonId = (params as HomeworkParams & { lessonId?: number }).lessonId;
  if (lessonId) {
    db.prepare(
      "UPDATE lessons SET transcript = ?, homework_md = ? WHERE id = ? AND student_id = ?"
    ).run(params.transcript, md, lessonId, params.studentId);
    return lessonId;
  }
  const info = db
    .prepare("INSERT INTO lessons (student_id, transcript, homework_md) VALUES (?, ?, ?)")
    .run(params.studentId, params.transcript, md);
  return Number(info.lastInsertRowid);
}
