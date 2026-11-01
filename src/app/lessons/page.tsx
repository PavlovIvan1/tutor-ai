import { LessonsTable } from "@/components/lessons/LessonsTable";
import { AuthGate } from "@/components/layout/AuthGate";

export default function LessonsPage() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Уроки</h1>
      <p className="mb-6 text-sm text-base-content/60">История всех уроков с датами и статусом домашки.</p>
      <AuthGate><LessonsTable /></AuthGate>
    </main>
  );
}
