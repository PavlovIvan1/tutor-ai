import { isAdmin, unauthorized } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

interface Counts { users: number; students: number; lessons: number; homework: number }
interface WeekRow { w: string; users: number; lessons: number }
interface AvgRow { avg_students: number; avg_lessons_week: number; avg_lesson_min: number }

/** GET: сводка для админ-дашборда (счетчики, рост по неделям, средние). */
export async function GET() {
  if (!isAdmin()) return unauthorized();
  const db = getDb();

  const counts = db
    .prepare(
      `SELECT (SELECT COUNT(*) FROM users) users,
              (SELECT COUNT(*) FROM students) students,
              (SELECT COUNT(*) FROM lessons) lessons,
              (SELECT COUNT(*) FROM lessons WHERE homework_md != '') homework`
    )
    .get() as Counts;

  const weeks = db
    .prepare(
      `SELECT strftime('%Y-W%W', created_at) w, COUNT(*) users
       FROM users GROUP BY w ORDER BY w DESC LIMIT 8`
    )
    .all() as WeekRow[];
  const lessonWeeks = db
    .prepare(
      `SELECT strftime('%Y-W%W', created_at) w, COUNT(*) lessons
       FROM lessons GROUP BY w ORDER BY w DESC LIMIT 8`
    )
    .all() as WeekRow[];

  const merged = [...new Set([...weeks, ...lessonWeeks].map((r) => r.w))]
    .sort()
    .reverse()
    .slice(0, 8)
    .map((w) => ({ week: w, users: weeks.find((r) => r.w === w)?.users ?? 0, lessons: lessonWeeks.find((r) => r.w === w)?.lessons ?? 0 }));

  const avg = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) * 1.0 FROM students) / MAX((SELECT COUNT(*) FROM users), 1) avg_students,
         (SELECT COUNT(*) FROM lessons WHERE created_at > datetime('now', '-28 days')) * 1.0 / 4 avg_lessons_week,
         (SELECT AVG(LENGTH(transcript) * 1.0 / 14 / 60) FROM lessons) avg_lesson_min`
    )
    .get() as AvgRow;

  return Response.json({
    counts,
    growth: merged.reverse(),
    averages: {
      studentsPerTeacher: round(avg.avg_students),
      lessonsPerWeek: round(avg.avg_lessons_week),
      lessonMinutes: round(avg.avg_lesson_min),
    },
  });
}

const round = (v: number) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);
