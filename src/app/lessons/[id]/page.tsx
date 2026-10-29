import { LessonDetail } from "@/components/lessons/LessonDetail";import { AuthGate } from "@/components/layout/AuthGate";

export default function LessonPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return <main className="p-8 text-sm text-error">Некорректный id урока</main>;
  }
  return (
    <AuthGate>
      <LessonDetail lessonId={id} />
    </AuthGate>
  );
}
